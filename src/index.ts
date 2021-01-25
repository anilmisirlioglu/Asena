import dotenv from 'dotenv';
import Logger from './utils/Logger';
import { ShardingManager } from 'discord.js';
import { parseAsenaASCIIArt } from './utils/ASCII';
import TextFormat from './utils/TextFormat';
import ServerStatsPacket from './protocol/ServerStatsPacket';
import { findFlagValue } from './utils/FlagParser';
import { updateDiscordBotsGGStats, updateTopGGStats } from './updater/StatsUpdater';
import TaskScheduler from './scheduler/TaskScheduler';
import AsyncRaffleTask from './scheduler/tasks/AsyncRaffleTask';
import AsyncSurveyTask from './scheduler/tasks/AsyncSurveyTask';
import MongoDB from './drivers/MongoDB';

dotenv.config({
    path: `${__dirname}/../.env`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const shards: "auto" | number = findFlagValue('shard') ?? "auto"

const isDevBuild = process.env.NODE_ENV !== 'production'
const manager = new ShardingManager('./build/shard.js', {
    totalShards: shards,
    token: process.env[isDevBuild ? 'TOKEN_DEV' : 'TOKEN'],
    shardArgs: [`--production=${!isDevBuild}`]
})

const logger = new Logger('main')

manager.on('shardCreate', async shard => {
    logger.info(`Shard ${shard.id} yaratıldı.`)

    shard.on('ready', () => {
        logger.info(`Shard ${shard.id} hazır.`)
    })

    shard.on('disconnect', () => {
        logger.info(`Shard ${shard.id} bağlantısı kesildi.`)
    })
})

const sendUpdateActivityPacket = async () => {
    const shards = manager.shards
    const fetch = await manager.fetchClientValues('guilds.cache.size')
    if(fetch.length > 0){
        const packet = new ServerStatsPacket({
            shardCount: shards.keyArray().length,
            serverCount: fetch.reduce((p, n) => p + n, 0)
        })

        shards.map(shard => shard.send(packet))

        if(!isDevBuild){
            updateTopGGStats(packet)
            updateDiscordBotsGGStats(packet)
        }
    }
}

const mongodb = new MongoDB()

const scheduleAsyncTasks = () => {
    const scheduler = new TaskScheduler(manager, [
        new AsyncRaffleTask(),
        new AsyncSurveyTask()
    ])

    scheduler.startTimer()
}

const handler = async () => {
    await Promise.all([
        mongodb.connect(),
        manager.spawn()
    ])

    logger.debug('Tüm shardlar konuşlandırıldı.')

    await sendUpdateActivityPacket()

    scheduleAsyncTasks()

    // Sends a packet to update the server count every 5 minutes
    setInterval(sendUpdateActivityPacket, 1000 * 60 * 5)
}

setTimeout(handler)

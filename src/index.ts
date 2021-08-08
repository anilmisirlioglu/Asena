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
import MongoDB from './MongoDB';
import { isDevBuild } from './utils/Version';
import './telemetry/TelemetryServer';

dotenv.config({
    path: `${__dirname}/../.env${isDevBuild ? '.local' : ''}`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const shards: "auto" | number = findFlagValue('shard') ?? "auto"
const manager = new ShardingManager('./build/shard.js', {
    totalShards: shards,
    token: process.env.TOKEN,
    shardArgs: [`--production=${!isDevBuild}`]
})

const logger = new Logger('main')

manager.on('shardCreate', async shard => {
    logger.info(`Shard ${shard.id} launched.`)

    shard.on('ready', () => {
        logger.info(`Shard ${shard.id} ready.`)
    })

    shard.on('disconnect', () => {
        logger.info(`Shard ${shard.id} disconnected.`)
    })
})

const sendUpdateActivityPacket = async () => {
    const shards = manager.shards
    const fetch = await manager.broadcastEval(client => client.guilds.cache.size)
    if(fetch.length > 0){
        const packet = new ServerStatsPacket({
            shardCount: shards.size,
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

    logger.debug('All shards deployed.')

    await sendUpdateActivityPacket()

    scheduleAsyncTasks()

    // Sends a packet to update the server count every 5 minutes
    setInterval(sendUpdateActivityPacket, 1000 * 60 * 5)
}

setTimeout(handler)

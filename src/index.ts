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
import CommandMetric from './telemetry/metrics/CommandMetric';
import { ProcessPacketType } from './protocol/ProcessPacket';
import ProcessMetric from './telemetry/metrics/ProcessMetric';

dotenv.config({
    path: `${process.cwd()}/.env${isDevBuild ? '.local' : ''}`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const shards: "auto" | number = findFlagValue('shard') ?? "auto"
const manager = new ShardingManager('./build/src/shard.js', {
    totalShards: shards,
    token: process.env.TOKEN,
    shardArgs: [`--production=${!isDevBuild}`]
})

const logger = new Logger('main')

const commandMetric = new CommandMetric()

manager.on('shardCreate', async shard => {
    logger.info(`Shard ${shard.id} launched.`)

    shard.on('ready', () => {
        logger.info(`Shard ${shard.id} ready.`)
    })

    shard.on('disconnect', () => {
        logger.info(`Shard ${shard.id} disconnected.`)
    })

    shard.on('message', message => {
        switch(message.type){
            case ProcessPacketType.COMMAND:
                commandMetric.observe(message.command)
                break
        }
    })
})

const pushUpdateActivityPacket = async () => {
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
    new ProcessMetric()

    await Promise.all([
        mongodb.connect(),
        manager.spawn({ timeout: -1 })
    ])

    logger.debug('All shards deployed.')

    pushUpdateActivityPacket().then(() => {
        setInterval(pushUpdateActivityPacket, 1000 * 60 * 5) // Sends a packet to update the server count every 5 minutes
    })

    scheduleAsyncTasks()
}

setTimeout(handler)

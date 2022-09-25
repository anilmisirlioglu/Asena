import dotenv from 'dotenv';
import Logger from './utils/Logger';
import { parseAsenaASCIIArt } from './utils/ASCII';
import TextFormat from './utils/TextFormat';
import ServerStatsPacket from './protocol/ServerStatsPacket';
import { findFlagValue } from './utils/FlagParser';
import { updateDiscordBotsGGStats, updateTopGGStats } from './updater/StatsUpdater';
import TaskScheduler from './scheduler/TaskScheduler';
import AsyncGiveawayTask from './scheduler/tasks/AsyncGiveawayTask';
import AsyncSurveyTask from './scheduler/tasks/AsyncSurveyTask';
import MongoDB from './MongoDB';
import { isDevBuild } from './utils/Version';
import './telemetry/TelemetryServer';
import ProcessMetric from './telemetry/metrics/ProcessMetric';
import ShardingManager from './ShardingManager';

dotenv.config({
    path: `${process.cwd()}/.env${isDevBuild ? '.local' : ''}`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const manager = new ShardingManager('./build/src/shard.js', {
    totalShards: findFlagValue('shard') ?? "auto",
    token: process.env.TOKEN,
    shardArgs: [`--production=${!isDevBuild}`]
})

const logger = new Logger('main')

const pushUpdateActivityPacket = async () => {
    const fetch = await manager.fetchClientValues('guilds.cache.size') as number[]
    if(fetch.length > 0){
        const shards = manager.shards
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
        new AsyncGiveawayTask(),
        new AsyncSurveyTask()
    ])

    scheduler.startTimer()
}

const handler = async () => {
    new ProcessMetric()

    await Promise.all([
        mongodb.connect(),
        manager.spawn()
    ])

    logger.debug('All shards launched.')

    manager.on('allShardsDeploy', () => {
        logger.debug('All shards deployed.')

        pushUpdateActivityPacket().then(() => {
            setInterval(pushUpdateActivityPacket, 1000 * 60 * 5) // Sends a packet to update the server count every 5 minutes
        })

        scheduleAsyncTasks()
    })
}

setTimeout(handler)

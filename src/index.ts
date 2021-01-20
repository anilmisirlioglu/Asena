/// <reference path='../typings/index.d.ts'/>

import dotenv from 'dotenv';
import Logger from './utils/Logger';
import { ShardingManager } from 'discord.js';
import { parseAsenaASCIIArt } from './utils/ASCII';
import TextFormat from './utils/TextFormat';
import ServerStatsPacket from './protocol/ServerStatsPacket';
import { findFlagValue } from './utils/FlagParser';
import { updateDiscordBotsGGStats, updateTopGGStats } from './updater/StatsUpdater';

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

const handler = async () => {
    await manager.spawn()

    logger.debug('Tüm shardlar konuşlandırıldı.')

    await sendUpdateActivityPacket()

    // Sends a packet to update the server count every 5 minutes
    setInterval(sendUpdateActivityPacket, 1000 * 60 * 5)
}

setTimeout(handler)

String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g,'')
}

Array.prototype.checkIfDuplicateExists = function(){
    return new Set(this).size !== this.length
}

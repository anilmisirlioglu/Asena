import dotenv from 'dotenv';
import Logger from './utils/Logger';
import { ShardingManager } from 'discord.js';
import { parseAsenaASCIIArt } from './utils/ASCII';
import TextFormat from './utils/TextFormat';
import ActivityUpdatePacket from './protocol/ActivityUpdatePacket';
import { findFlagValue } from './utils/FlagParser';

dotenv.config({
    path: `${__dirname}/../.env`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const shards: "auto" | number = findFlagValue('shards') ?? "auto"

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
    if(fetch.length > 0 && shards.first()){
        const packet = new ActivityUpdatePacket({
            shardCount: shards.keyArray().length,
            serverCount: fetch.reduce((p, n) => p + n, 0)
        })

        await shards.first().send(packet)
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

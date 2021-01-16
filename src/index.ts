import dotenv from 'dotenv';
import Logger from './utils/Logger';
import { ShardingManager } from 'discord.js';

dotenv.config({
    path: `${__dirname}/../.env`
})

const isDevBuild = process.env.NODE_ENV !== 'production'
const manager = new ShardingManager('./build/shard.js', {
    totalShards: 'auto',
    token: process.env[isDevBuild ? 'TOKEN_DEV' : 'TOKEN'],
    shardArgs: [`--production=${isDevBuild}`]
})

const logger = new Logger()

manager.on('shardCreate', shard => {
    logger.info(`Shard ${shard.id} yaratıldı.`)

    shard.on('ready', () => {
        logger.info(`Shard ${shard.id} hazır.`)
    })

    shard.on('disconnect', () => {
        logger.info(`Shard ${shard.id} bağlantısı kesildi.`)
    })
})

const handler = async () => {
    await manager.spawn()
}

setTimeout(handler)

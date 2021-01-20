import request from '../utils/Internet';
import { Bot, DISCORD_BOTS_GG_URL, TOP_GG_URL } from '../Constants';
import ServerStatsPacket from '../protocol/ServerStatsPacket';

const updateTopGGStats = (packet: ServerStatsPacket) => {
    request({
        host: TOP_GG_URL,
        path: `/api/bots/${Bot.CLIENT_ID}/stats`,
        method: 'POST',
        headers: {
            Authorization: process.env.TOP_GG_API_KEY
        }
    }, {
        server_count: packet.serverCount,
        shard_count: packet.shardCount
    })
}

const updateDiscordBotsGGStats = (packet: ServerStatsPacket) => {
    request({
        host: DISCORD_BOTS_GG_URL,
        path: `/api/v1/bots/${Bot.CLIENT_ID}/stats`,
        method: 'POST',
        headers: {
            Authorization: process.env.DISCORD_BOTS_GG_API_KEY
        }
    }, {
        guildCount: packet.serverCount,
        shardCount: packet.shardCount
    })
}

export {
    updateTopGGStats,
    updateDiscordBotsGGStats
}

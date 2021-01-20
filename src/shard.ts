import Asena from './Asena';
import MongoDB from './drivers/MongoDB';
import ProcessPacket, { ProcessPacketType } from './protocol/ProcessPacket';
import ServerStatsPacket from './protocol/ServerStatsPacket';
import { findFlagValue } from './utils/FlagParser';

let isProduction: boolean = findFlagValue('--production') ?? false

const mongo = new MongoDB()
const client = new Asena(!isProduction)

process.on('unhandledRejection', (rej) => {
    client.logger.error(rej?.toString() ?? 'Unknown Error')
})

process.on('SIGTERM', async () => {
    if(MongoDB.isConnected()){
        await mongo.disconnect().then(() => {
            client.logger.info('Uygulama sonlanmasıyla veritabanı bağlantısı kapatıldı.')
        })
    }

    process.exit(0)
})

process.on('message', async (packet: ProcessPacket) => {
    switch(packet.type){
        case ProcessPacketType.SERVER_STATS:
            // noinspection ES6MissingAwait
            client.getActivityUpdater().updateActivity(packet as ServerStatsPacket)
            break
    }
})

const handler = async () => {
    await mongo.connect()

    await client.login(process.env[isProduction ? 'TOKEN' : 'TOKEN_DEV'])
}

setTimeout(handler)

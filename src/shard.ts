import Asena from './Asena';
import MongoDB from './drivers/MongoDB';
import ProcessPacket, { ProcessPacketType } from './protocol/ProcessPacket';
import ActivityUpdatePacket from './protocol/ActivityUpdatePacket';
import { findFlagValue } from './utils/FlagParser';

let isDevBuild: boolean = findFlagValue('--production') ?? false

const mongo = new MongoDB()
const client = new Asena(isDevBuild)

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
        case ProcessPacketType.ACTIVITY_UPDATE:
            // noinspection ES6MissingAwait
            client.getActivityUpdater().updateActivity(packet as ActivityUpdatePacket)
            break
    }
})

const handler = async () => {
    await mongo.connect()

    await client.login(process.env[isDevBuild ? 'TOKEN_DEV' : 'TOKEN'])
}

setTimeout(handler)

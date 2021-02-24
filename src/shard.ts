/// <reference path='../typings/index.d.ts'/>

import Asena from './Asena';
import MongoDB from './drivers/MongoDB';
import { ProcessPacketType } from './protocol/ProcessPacket';
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

process.on('message', async (packet) => {
    switch(packet.type){
        case ProcessPacketType.SERVER_STATS:
            client.getActivityUpdater().updateActivity(packet).then(void 0)
            break

        case ProcessPacketType.MODEL_TRANSFER:
            switch(packet.modelType){
                case 'Raffle':
                    client.getTaskManager().executeRaffleTask(packet.items).then(void 0)
                    break

                case 'Survey':
                    client.getTaskManager().executeSurveyTask(packet.items).then(void 0)
                    break
                }
                break
    }
})

const handler = async () => {
    await mongo.connect()

    await client.login(process.env[isProduction ? 'TOKEN' : 'TOKEN_DEV'])
}

setTimeout(handler)

String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g,'')
}

Array.prototype.checkIfDuplicateExists = function(){
    return new Set(this).size !== this.length
}

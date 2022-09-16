/// <reference path='../typings/index.d.ts'/>

import Asena from './Asena';
import MongoDB from './MongoDB';
import { ProcessPacketType } from './protocol/ProcessPacket';
import { findFlagValue } from './utils/FlagParser';
import Logger from './utils/Logger';
import { isDevBuild } from './utils/Version';
import { Packet } from './protocol/packets';

const isProduction: boolean = findFlagValue('--production') ?? false

const mongo = new MongoDB()
const client = new Asena(!isProduction)

process.on('unhandledRejection', (rej: Error | null | undefined) => {
    if(typeof rej === 'object'){
        if(isDevBuild || rej.name !== 'DiscordAPIError'){
            client.logger.error(rej.message, Logger.formatError(rej))
        }
    }
})

process.on('uncaughtException', (e: Error) => {
    client.logger.error(e.message, Logger.formatError(e))
})

process.on('SIGTERM', async () => {
    if(MongoDB.isConnected()){
        await mongo.disconnect().then(() => {
            client.logger.info('Database connection closed on application termination.')
        })
    }

    process.exit(0)
})

process.on('message', async (packet: Packet) => {
    switch(packet.type){
        case ProcessPacketType.ServerStats:
            client.getActivityUpdater().setActivity(packet)
            break

        case ProcessPacketType.ModelTransfer:
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

    await client.login(process.env.TOKEN)
}

setTimeout(handler)

String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g,'')
}

Array.prototype.checkIfDuplicateExists = function(){
    return new Set(this).size !== this.length
}

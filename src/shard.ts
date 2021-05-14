import Asena from './Asena';
import MongoDB from './MongoDB';
import { findFlagValue } from './utils/FlagParser';
import { ProcessPacketType } from './protocol/ProcessPacket';

let isProduction: boolean = findFlagValue('--production') ?? false

const mongo = new MongoDB()
const client = new Asena(!isProduction)

process.on('unhandledRejection', (rej) => {
    client.logger.error(rej?.toString() ?? 'Unknown Error')
})

process.on('SIGTERM', async () => {
    if(MongoDB.isConnected()){
        await mongo.disconnect().then(() => {
            client.logger.info('Database connection closed on application termination.')
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

    await client.login(process.env.TOKEN)
}

setTimeout(handler)

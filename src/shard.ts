import Asena from './Asena';
import MongoDB from './drivers/MongoDB';

const flag = '--production'
const find = process.argv.find(argv => argv
    .slice(0, flag.length)
    .trim() === flag
)

let isDevBuild = false
if(find){
    const split = find.split('=')
    if(split.length > 1){
        isDevBuild = Boolean(split.pop())
    }
}

const mongo = new MongoDB()
const client = new Asena(isDevBuild)

process.on('unhandledRejection', (rej, promise) => {
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

const handler = async () => {
    await mongo.connect()

    await client.login(process.env[isDevBuild ? 'TOKEN_DEV' : 'TOKEN'])
}

setTimeout(handler)

import dotenv from 'dotenv'
import Asena from './Asena';

dotenv.config({
    path: `${__dirname}/../.env`
})

const client = new Asena()
// noinspection JSIgnoredPromiseFromCall
client.login(process.env[client.version.isDev() ? 'TOKEN_DEV' : 'TOKEN'])

process.on('unhandledRejection', (rej, promise) => {
    client.logger.warning(rej?.toString() ?? '')
})
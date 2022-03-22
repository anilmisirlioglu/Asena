import Logger from '../src/utils/Logger';
import Distributor from './Distributor';
import Pool from './Pool';
import dotenv from 'dotenv';
import { isDevBuild } from '../src/utils/Version';
import TextFormat from '../src/utils/TextFormat';
import { parseAsenaASCIIArt } from '../src/utils/ASCII';

dotenv.config({
    path: `${__dirname}/../../.env${isDevBuild ? '.local' : ''}`
})

TextFormat.init()

console.clear()
console.log(TextFormat.toANSI(parseAsenaASCIIArt()))

const distributor = new Distributor()
const logger = new Logger('command')

const run = async() => {
    logger.info('Started refreshing application (/) commands.')

    distributor.registerCommands(new Pool())

    distributor.publish().catch(logger.error).then(() => {
        logger.info('Successfully reloaded application (/) commands.')
    })
}

setTimeout(run)
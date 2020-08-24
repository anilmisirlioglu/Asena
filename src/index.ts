/// <reference path='../typings/index.d.ts'/>

import dotenv from 'dotenv';
import Asena from './Asena';
import MongoDB from './drivers/MongoDB';

dotenv.config({
    path: `${__dirname}/../.env`
})

const mongo = new MongoDB()
// noinspection JSIgnoredPromiseFromCall
mongo.connect()

const client = new Asena()
// noinspection JSIgnoredPromiseFromCall
client.login(process.env[client.version.isDev() ? 'TOKEN_DEV' : 'TOKEN'])

process.on('unhandledRejection', (rej, promise) => {
    client.logger.error(rej?.toString() ?? 'Unknown Error')
})

String.prototype.removeWhiteSpaces = function(){
    return this.replace(/\s|\x00|\x0B/g,'')
}

Array.prototype.checkIfDuplicateExists = function(){
    return new Set(this).size !== this.length
}

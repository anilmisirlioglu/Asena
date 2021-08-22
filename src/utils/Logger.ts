import TextFormat, { Colors } from './TextFormat';
import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { isDevBuild } from './Version';
import { Error } from 'mongoose';

enum Space{
    WORKER = 7,
    LEVEL  = 5
}

const colors = {
    'info': Colors.GREEN,
    'warning': Colors.YELLOW,
    'error': Colors.RED,
    'debug': Colors.AQUA
}

export default class Logger{

    private readonly winston: winston.Logger

    constructor(worker: string){
        TextFormat.init()

        this.winston = winston.createLogger({
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                debug: 5
            },
            transports: [
                new winston.transports.Console({ level: 'debug' }),
                isDevBuild ? undefined : new LoggingWinston({
                    projectId: 'syntax-asena',
                    keyFilename: 'asena-gcloud-key.json',
                    level: 'error'
                })
            ].filter(Boolean),
            format: winston.format.combine(
                winston.format.label({ label: worker }),
                winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
                winston.format.metadata({
                    fillExcept: ['message', 'level', 'timestamp', 'label']
                }),
                winston.format.printf(this.templateFunc)
            )
        })
    }

    // raw format: DD-MM-YYYY HH:mm:ss {log level} {process id} [{worker}] > {message}
    private templateFunc = (info: winston.Logform.TransformableInfo): string => TextFormat.toANSI(`${Colors.DARK_GRAY}${info.timestamp} ${this.parseLogLevel(info.level)} ${Colors.DARK_PURPLE}${process.pid} ${Colors.WHITE}[${Colors.AQUA}${this.space(info.label)}${Colors.WHITE}] ${Colors.GOLD}> ${Colors.WHITE}${info.message}${Colors.RESET}`)

    private parseLogLevel(text: string): string{
        return (colors[text] ?? Colors.RED) + this.space(text.toUpperCase(), Space.LEVEL, true)
    }

    private space(text: string, space: Space = Space.WORKER, spacesIsRightSide: boolean = false): string{
        if(text.length >= space){
            return text.slice(0, space)
        }

        const spaces = ' '.repeat(space - text.length)
        return spacesIsRightSide ? text + spaces : spaces + text
    }

    error   = (message: string, ...meta: any[]) => this.winston.error(message, ...meta)
    warning = (message: string, ...meta: any[]) => this.winston.warn(message, ...meta)
    info    = (message: string, ...meta: any[]) => this.winston.info(message, ...meta)
    debug   = (message: string, ...meta: any[]) => this.winston.debug(message, ...meta)

    static formatError(e: Error){
        return {
            stack: e.stack.split(`\n`).map(line => line.trim()),
            name: e.name
        }
    }

}

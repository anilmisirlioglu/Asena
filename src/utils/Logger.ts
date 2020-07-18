import fs from 'fs';
import TextFormat, { Colors } from './TextFormat';

enum LogLevel{
    ERROR = 'Error',
    WARNING = 'Warning',
    INFO = 'Info',
    DEBUG = 'Debug'
}

export default class Logger{

    private static LOG = 'log.txt';
    private static LOG_DIR = `${__dirname}/../../` + Logger.LOG;

    constructor(){
        TextFormat.init();

        if(!fs.existsSync(Logger.LOG)){
            fs.closeSync(fs.openSync(Logger.LOG, 'w+'))
        }
    }

    private static send(message: string, level: LogLevel, color: Colors): void{
        const date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')

        const format = `[${date}] [${level}] ${message}`;

        fs.appendFileSync(
            Logger.LOG_DIR,
            `\n${TextFormat.clean(format)}`
        );

        console.log(TextFormat.toANSI(color + format + Colors.RESET));
    }

    public error(message: string): void{
        Logger.send(message, LogLevel.ERROR, Colors.RED);
    }

    public warning(message: string): void{
        Logger.send(message, LogLevel.WARNING, Colors.YELLOW);
    }

    public info(message: string): void{
        Logger.send(message, LogLevel.INFO, Colors.AQUA);
    }

    public debug(message: string): void{
        Logger.send(message, LogLevel.DEBUG, Colors.GRAY);
    }

}
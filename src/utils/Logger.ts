import fs from 'fs';
import TextFormat, { Colors } from './TextFormat';

enum LogLevel{
    ERROR = `ERROR`,
    WARNING = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG'
}

type ColorizedLogLevel = string

enum Space{
    WORKER = 7
}

export default class Logger{

    private static LOG = 'log.txt';
    private static LOG_DIR = `${__dirname}/../../` + Logger.LOG;

    private readonly worker: string

    constructor(worker: string){
        this.worker = worker

        TextFormat.init()

        if(!fs.existsSync(Logger.LOG)){
            fs.closeSync(fs.openSync(Logger.LOG, 'w+'))
        }
    }

    private send(message: string, level: ColorizedLogLevel): void{
        const date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')

        const format = `${Colors.DARK_GRAY}${date} ${level} ${Colors.DARK_PURPLE}${process.pid} ${Colors.WHITE}[${Colors.AQUA}${this.space(this.worker)}${Colors.WHITE}] ${Colors.GOLD}> ${Colors.WHITE}${message}`;

        fs.appendFileSync(
            Logger.LOG_DIR,
            `\n${TextFormat.clean(format)}`
        );

        console.log(TextFormat.toANSI(format + Colors.RESET));
    }

    private space(text: string, space: Space = Space.WORKER): string{
        return text.length >= space ? text.slice(0, space) : ' '.repeat(space - text.length) + text
    }

    public error(message: string): void{
        this.send(message, Colors.RED + LogLevel.ERROR);
    }

    public warning(message: string): void{
        this.send(message, Colors.GOLD + LogLevel.WARNING + ' ');
    }

    public info(message: string): void{
        this.send(message, Colors.GREEN + LogLevel.INFO + ' ');
    }

    public debug(message: string): void{
        this.send(message, Colors.AQUA + LogLevel.DEBUG);
    }

}

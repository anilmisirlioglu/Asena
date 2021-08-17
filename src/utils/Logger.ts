import TextFormat, { Colors } from './TextFormat';

enum LogLevel{
    ERROR = 'ERROR',
    WARNING = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG'
}

type ColorizedLogLevel = string

enum Space{
    WORKER = 7
}

export default class Logger{

    private readonly worker: string

    constructor(worker: string){
        this.worker = worker

        TextFormat.init()
    }

    private send(message: string, level: ColorizedLogLevel): void{
        const date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')

        const format = `${Colors.DARK_GRAY}${date} ${level} ${Colors.DARK_PURPLE}${process.pid} ${Colors.WHITE}[${Colors.AQUA}${this.space(this.worker)}${Colors.WHITE}] ${Colors.GOLD}> ${Colors.WHITE}${message}`;
        console.log(TextFormat.toANSI(format + Colors.RESET));
    }

    private space(text: string, space: Space = Space.WORKER): string{
        return text.length >= space ? text.slice(0, space) : ' '.repeat(space - text.length) + text
    }

    error   = (message: string) => this.send(message, Colors.RED + LogLevel.ERROR)
    warning = (message: string) => this.send(message, Colors.GOLD + LogLevel.WARNING + ' ')
    info    = (message: string) => this.send(message, Colors.GREEN + LogLevel.INFO + ' ')
    debug   = (message: string) => this.send(message, Colors.AQUA + LogLevel.DEBUG)

}

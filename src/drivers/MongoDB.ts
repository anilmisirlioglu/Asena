import mongoose, { ConnectionOptions, Mongoose } from 'mongoose'
import Logger from '../utils/Logger';

export default class MongoDB{

    private readonly options: ConnectionOptions
    private static _isConnected: boolean = false

    private logger: Logger = new Logger(MongoDB.name.toLowerCase())

    public constructor(options: ConnectionOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }){
        this.options = options

        // event listeners
        mongoose.connection.on('open', () => {
            this.logger.info('Veritabanı bağlantısı başarıyla kuruldu.');

            this.setConnected(true)
        })

        mongoose.connection.on('disconnected', () => {
            this.logger.info('Veritabanı bağlantısı kesildi.')

            this.setConnected(false)
        })

        mongoose.connection.on('error', err => {
            this.logger.error('Veritabanında bağlantı hatası: ' + err)
        })
    }

    public getOptions(): ConnectionOptions{
        return this.options
    }

    public async connect(): Promise<Mongoose>{
        return mongoose.connect(process.env.DB_CONN_STRING, this.options)
    }

    public async disconnect(){
        return mongoose.disconnect()
    }

    public static isConnected(): boolean{
        return this._isConnected
    }

    // noinspection JSMethodCanBeStatic
    private setConnected(connected: boolean){
        MongoDB._isConnected = connected
    }

}

export { MongoDB }

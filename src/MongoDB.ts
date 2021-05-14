import mongoose, { ConnectionOptions, Mongoose } from 'mongoose'
import Logger from './utils/Logger';

export default class MongoDB{

    private static STATES = {
        0: 'global.states.disconnected',
        1: 'global.states.connected',
        2: 'global.states.connecting.',
        3: 'global.states.disconnecting',
        99: 'global.states.uninitialized.'
    }

    private readonly options: ConnectionOptions

    private static _isConnected: boolean = false
    public static serverInfo: Object

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
            this.logger.info('Database connection has been established successfully.')

            this.setConnected(true)

            mongoose.connection.db.admin().serverInfo().then(obj => {
                MongoDB.serverInfo = obj
            })
        })

        mongoose.connection.on('disconnected', () => {
            this.logger.info('Database connection disconnected.')

            this.setConnected(false)
        })

        mongoose.connection.on('error', err => {
            this.logger.error('Database connection error: ' + err)
        })
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

    public static getState(): string{
        return MongoDB.STATES[mongoose.connection.readyState] ?? 'global.states.unknown'
    }

    // noinspection JSMethodCanBeStatic
    private setConnected(connected: boolean){
        MongoDB._isConnected = connected
    }

}

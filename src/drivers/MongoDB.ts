import mongoose, { ConnectionOptions, Mongoose } from 'mongoose'

export default class MongoDB{

    private readonly options: ConnectionOptions

    public constructor(options: ConnectionOptions = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }){
        this.options = options

        // event listeners
        mongoose.connection.on('open', () => {
            console.log('Veritabanı bağlantısı başarıyla kuruldu.');
        })

        mongoose.connection.on('error', () => {
            console.log('Veritabanı bağlantısı kurulamadı.');
        })
    }

    public getOptions(): ConnectionOptions{
        return this.options
    }

    public async connect(): Promise<Mongoose>{
        return mongoose.connect(process.env.DB_CONN_STRING, this.options)
    }

}

export { MongoDB }
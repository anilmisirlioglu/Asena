import Manager from './Manager'
import { Snowflake } from 'discord.js'
import Server from '../models/Server';

interface IServer{
    server_id: string,
    prefix: string,
    publicCommands: string[]
}

type TServer = IServer | undefined

export default class ServerManager extends Manager{

    private readonly servers: { [key: string]: IServer } = {}

    public async getServer(server_id: Snowflake){
        let server = this.getServerDataFromCache(server_id)
        if(!server){
            server = await this.getServerDataFromDatabase(server_id)
            if(server){
                this.setServerDataCache(server_id, server)
            }
        }

        return server
    }

    public async getServerDataFromDatabase(server_id: Snowflake): Promise<TServer>{
        const server = await Server.findOne({ server_id })
        if(!server){
            return null
        }

        return server
    }

    private getServerDataFromCache(server_id: Snowflake): TServer{
        return this.servers[server_id]
    }

    private setServerDataCache(server_id: Snowflake, server: IServer): void{
        this.servers[server_id] = server
    }

    private deleteServerDataFromCache(server_id: Snowflake): void{
        delete this.servers[server_id]
    }

}
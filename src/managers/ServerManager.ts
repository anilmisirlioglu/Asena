import Manager from './Manager'
import { Snowflake } from 'discord.js'
import Server, { IServer } from '../models/Server';
import { UpdateQuery } from 'mongoose';

type CommandUpdateOption = 'ADD' | 'DELETE'

export default class ServerManager extends Manager{

    private readonly servers: { [key: string]: IServer } = {}

    public async getServerData(server_id: Snowflake): Promise<IServer>{
        let server = this.getServerDataFromCache(server_id)
        if(!server){
            server = await this.getServerDataFromDatabase(server_id)
            if(server){
                this.setServerDataCache(server_id, server)
            }
        }

        return server
    }

    public async deleteServerData(server_id: Snowflake): Promise<void>{
        await Server.deleteOne({ server_id })

        this.deleteServerDataFromCache(server_id)
    }

    public async setServerPrefix(server_id: Snowflake, prefix: string): Promise<void>{
        await this.updateServer(server_id, { prefix })
    }

    public async setPublicCommandServer(server_id: Snowflake, command: string, type: CommandUpdateOption): Promise<void>{
        const object = {
            [type === 'ADD' ? '$push' : '$pull']: {
                publicCommands: command
            }
        }

        await this.updateServer(server_id, object)
    }

    private async updateServer(server_id: Snowflake, query: UpdateQuery<any>): Promise<void>{
        const update = await Server.findByIdAndUpdate(
            (await this.getServerData(server_id))._id,
            query,
            { new: true }
        )

        if(update){
            this.setServerDataCache(server_id, update)
        }
    }

    private async getServerDataFromDatabase(server_id: Snowflake): Promise<IServer>{
        let server = await Server.findOne({ server_id })
        if(!server){
            server = await Server.create({ server_id })
        }

        return server
    }

    private getServerDataFromCache(server_id: Snowflake): IServer | undefined{
        return this.servers[server_id]
    }

    private setServerDataCache(server_id: Snowflake, server: IServer): void{
        this.servers[server_id] = server
    }

    private deleteServerDataFromCache(server_id: Snowflake): void{
        delete this.servers[server_id]
    }

}
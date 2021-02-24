import ProcessPacket, { ProcessPacketType } from './ProcessPacket';

interface IServerStatsPacket{
    serverCount: number
    shardCount: number
}

export default class ServerStatsPacket extends ProcessPacket implements IServerStatsPacket{

    serverCount: number
    shardCount: number

    constructor(payload: IServerStatsPacket){
        super({
            type: ProcessPacketType.SERVER_STATS,
            payload
        })
    }

}

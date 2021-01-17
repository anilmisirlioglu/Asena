import ProcessPacket, { ProcessPacketType } from './ProcessPacket';

interface IActivityUpdatePacket{
    serverCount: number
    shardCount: number
}

export default class ActivityUpdatePacket extends ProcessPacket implements IActivityUpdatePacket{

    serverCount: number
    shardCount: number

    constructor(data: IActivityUpdatePacket){
        super({
            type: ProcessPacketType.ACTIVITY_UPDATE,
            data
        })
    }

}

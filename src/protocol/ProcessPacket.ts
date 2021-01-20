export enum ProcessPacketType{
    SERVER_STATS
}

interface ProcessPacketData{
    [key: string]: any
}

interface IProcessPacket{
    type: ProcessPacketType
    data: ProcessPacketData
}

export default abstract class ProcessPacket{

    readonly type: ProcessPacketType

    protected constructor(data: IProcessPacket){
        this.type = data.type

        this.decode(data.data)
    }

    protected decode(data: ProcessPacketData){
        for(const [key, value] of Object.entries(data)){
            this[key] = value
        }
    }

}

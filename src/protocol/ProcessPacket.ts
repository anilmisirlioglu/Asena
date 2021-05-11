export enum ProcessPacketType{
    SERVER_STATS,
    MODEL_TRANSFER
}

interface ProcessPacketPayload{
    [key: string]: any
}

interface IProcessPacket{
    type: ProcessPacketType
    payload: ProcessPacketPayload
}

export default abstract class ProcessPacket{

    readonly type: ProcessPacketType

    protected constructor(packet: IProcessPacket){
        this.type = packet.type

        this.decode(packet.payload)

        this.observeMetric()
    }

    protected decode(data: ProcessPacketPayload){
        for(const [key, value] of Object.entries(data)){
            this[key] = value
        }
    }

    abstract observeMetric(): void

}

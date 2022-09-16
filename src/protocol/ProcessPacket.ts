export enum ProcessPacketType{
    ServerStats,
    ModelTransfer,
    Command
}

interface ProcessPacketPayload{
    [key: string]: any
}

export default abstract class ProcessPacket{

    readonly abstract type: ProcessPacketType

    protected constructor(payload: ProcessPacketPayload){
        this.decode(payload)

        this.observeMetric()
    }

    protected decode(data: ProcessPacketPayload){
        for(const [key, value] of Object.entries(data)){
            this[key] = value
        }
    }

    abstract observeMetric(): void

}

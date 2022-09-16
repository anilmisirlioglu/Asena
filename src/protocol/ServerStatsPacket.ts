import ProcessPacket, { ProcessPacketType } from './ProcessPacket';
import { serverMetric, shardMetric } from '../telemetry/metrics/NumericMetric';

interface ServerStatsPacketPayload{
    serverCount: number
    shardCount: number
}

export default class ServerStatsPacket extends ProcessPacket implements ServerStatsPacketPayload{

    readonly type: ProcessPacketType.ServerStats = ProcessPacketType.ServerStats
    serverCount: number
    shardCount: number

    constructor(payload: ServerStatsPacketPayload){
        super(payload)
    }

    observeMetric(){
        serverMetric.observe(this.serverCount)
        shardMetric.observe(this.shardCount)
    }

}

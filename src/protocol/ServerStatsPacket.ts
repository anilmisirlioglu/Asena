import ProcessPacket, { ProcessPacketType } from './ProcessPacket';
import { serverMetric, shardMetric } from '../telemetry/metrics/NumericMetric';

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

    observeMetric(){
        serverMetric.observe(this.serverCount)
        shardMetric.observe(this.shardCount)
    }

}

import ProcessPacket, { ProcessPacketType } from './ProcessPacket';

export default class CommandPacket extends ProcessPacket{

    constructor(command: string){
        super({
            type: ProcessPacketType.COMMAND,
            payload: { command }
        })
    }

    observeMetric(){}

}

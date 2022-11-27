import ProcessPacket, { ProcessPacketType } from './ProcessPacket';

export default class CommandPacket extends ProcessPacket{

    readonly type: ProcessPacketType.Command = ProcessPacketType.Command

    constructor(command: string){
        super({ command })
    }

    observeMetric(){}

}

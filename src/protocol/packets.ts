import ServerStatsPacket from './ServerStatsPacket';
import ModelTransferPacket from './ModelTransferPacket';
import CommandPacket from './CommandPacket';

export type Packet = ServerStatsPacket | ModelTransferPacket<any> | CommandPacket
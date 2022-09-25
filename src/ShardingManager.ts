import { Collection, Shard, ShardingManager as Manager } from 'discord.js';
import * as events from 'events';
import CommandMetric from './telemetry/metrics/CommandMetric';
import Logger from './utils/Logger';
import { ProcessPacketType } from './protocol/ProcessPacket';

declare interface ShardingManager{
    on(event: 'allShardsDeploy', listener: () => {}): this
    on(event: string, listener: Function): this;
}

class ShardingManager extends Manager implements events.EventEmitter{

    private logger = new Logger('shard')

    private commandMetric = new CommandMetric()

    private ready: number[] = []

    spawn(): Promise<Collection<number, Shard>>{
        this.on('shardCreate', this.launch)
        return super.spawn({
            timeout: -1
        });
    }

    private onShardReady(shard: Shard){
        this.ready.push(shard.id)
        if(this.ready.length == this.totalShards){
            this.emit('allShardsDeploy')
        }
    }

    private launch(shard: Shard){
        this.logger.info(`Shard ${shard.id} launched.`)

        shard.on('ready', () => {
            this.logger.info(`Shard ${shard.id} ready.`)
            this.onShardReady(shard)
        })

        shard.on('disconnect', () => {
            this.logger.info(`Shard ${shard.id} disconnected.`)
        })

        shard.on('message', message => {
            switch(message.type){
                case ProcessPacketType.Command:
                    this.commandMetric.observe(message.command)
                    break
            }
        })
    }

}

export default ShardingManager
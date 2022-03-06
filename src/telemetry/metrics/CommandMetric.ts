import cron from 'node-cron';
import Gauge from './types/Gauge';

export default class CommandMetric extends Gauge<string>{

    constructor(){
        super({
            name: 'asena_command_usage',
            help: 'asena_command_usage',
            labelNames: ['command'] as const
        })

        cron.schedule('* * * * *', () => {
            this.reset()
        })
    }

    observe(command: string){
        this.inc({ command })
    }

}

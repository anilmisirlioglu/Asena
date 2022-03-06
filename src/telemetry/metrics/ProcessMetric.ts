import Gauge from './types/Gauge';

export default class ProcessMetric extends Gauge{

    constructor(){
        super({
            name: 'asena_process_uptime',
            help: 'Asena process uptime.',
            collect: () => {
                this.set(process.uptime())
            }
        })
    }

    observe(){}

}

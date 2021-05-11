import GaugeMetric from './types/GaugeMetric';

export default class ProcessMetric extends GaugeMetric{

    constructor(){
        super({
            name: 'asena_process_uptime',
            help: 'Asena process uptime.'
        })
    }

    observe(){
        this.set(process.uptime())
    }

}

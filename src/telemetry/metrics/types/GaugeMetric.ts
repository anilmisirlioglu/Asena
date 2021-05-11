import { Gauge, GaugeConfiguration } from 'prom-client';
import registry from './../../Registry';

export default abstract class GaugeMetric<T = void> extends Gauge<string>{

    constructor(configuration: Omit<GaugeConfiguration<string>, 'registers'>){
        super(Object.assign(configuration, {
            registers: [registry]
        }))
    }

    abstract observe(value: T): void

}

import client, { GaugeConfiguration } from 'prom-client';
import registry from './../../Registry';

export default abstract class Gauge<T = void> extends client.Gauge<string>{

    constructor(configuration: Omit<GaugeConfiguration<string>, 'registers'>){
        super(Object.assign(configuration, {
            registers: [registry]
        }))
    }

    abstract observe(value: T): void

}

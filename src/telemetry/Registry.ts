import client, { Registry } from 'prom-client';

const registry = new Registry()
client.collectDefaultMetrics({
    register: registry
})

export default registry

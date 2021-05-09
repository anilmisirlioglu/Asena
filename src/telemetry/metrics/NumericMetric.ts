import GaugeMetric from './types/GaugeMetric';

class NumericMetric extends GaugeMetric<number>{

    observe(value: number){
        this.set(value)
    }

}

const serverMetric = new NumericMetric({
    name: 'asena_server_count',
    help: 'Asena server count.'
})

const shardMetric = new NumericMetric({
    name: 'asena_shard_count',
    help: 'Asena shard count.'
})

const continuingGiveawayMetric = new NumericMetric({
    name: 'asena_continuing_giveaway_count',
    help: 'Asena continuing giveaway count.'
})

const continuingSurveyMetric = new NumericMetric({
    name: 'asena_continuing_survey_count',
    help: 'Asena continuing survey count.'
})

export {
    serverMetric,
    shardMetric,
    continuingGiveawayMetric,
    continuingSurveyMetric
}

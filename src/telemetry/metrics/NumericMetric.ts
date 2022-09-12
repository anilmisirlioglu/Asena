import Gauge from './types/Gauge';

class NumericMetric extends Gauge<number>{

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

const continuingExVersionGiveawayMetric = new NumericMetric({
    name: 'asena_continuing_ex_version_giveaway_count',
    help: 'Asena continuing ex version giveaway count.'
})

const continuingSurveyMetric = new NumericMetric({
    name: 'asena_continuing_survey_count',
    help: 'Asena continuing survey count.'
})

export {
    serverMetric,
    shardMetric,
    continuingGiveawayMetric,
    continuingExVersionGiveawayMetric,
    continuingSurveyMetric
}

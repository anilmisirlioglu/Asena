import Gauge from './types/Gauge';
import Version from '../../utils/Version';

export default class VersionMetric extends Gauge<Version>{

    constructor(){
        super({
            name: 'asena_version_info',
            help: 'asena_version_info',
            labelNames: ['version', 'major', 'minor', 'patch']
        })
    }

    observe(version: Version){
        this.set(version.toObject(), version.getNumber())
    }

}

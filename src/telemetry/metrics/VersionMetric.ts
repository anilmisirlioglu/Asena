import GaugeMetric from './types/GaugeMetric';
import Version from '../../utils/Version';

export default class VersionMetric extends GaugeMetric<Version>{

    constructor(){
        super({
            name: 'asena_version_info',
            help: 'asena_version_info',
            labelNames: ['version', 'major', 'minor', 'patch']
        })
    }

    observe(version: Version){
        this.set({
            version: version.getFullVersion(),
            major: version.getMajor(),
            minor: version.getMinor(),
            patch: version.getPatch()
        }, 1)
    }

}

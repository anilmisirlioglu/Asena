import * as http from 'http';
import * as url from 'url';
import Logger from '../utils/Logger';
import Version, { isDevBuild } from '../utils/Version';
import ProcessMetric from './metrics/ProcessMetric';
import VersionMetric from './metrics/VersionMetric';
import registry from './Registry';

const version = new Version(process.env.npm_package_version, isDevBuild)
registry.setDefaultLabels({
    app: `asena-v${version.getFullVersion()}`
})

const logger = new Logger('prometheus')
const server = http.createServer(async (req, res) => {
    const route = url.parse(req.url).pathname
    if(route === '/metrics'){
        try{
            res.setHeader('Content-Type', registry.contentType)
            registry.metrics().then(metrics => {
                res.end(metrics)
            })
        }catch(e){
            res.writeHead(500).end()
        }
    }
}).listen(8080, () => {
    logger.info('HTTP sunucusu aktif. Telemetri verileri /metrics üzerinden sunuluyor.')
})

const versionMetric = new VersionMetric()
versionMetric.observe(version)

const uptimeMetric = new ProcessMetric()
const handler = setInterval(() => { uptimeMetric.observe() }, 1000 * 12)

// Graceful Shutdown
process.on('SIGTERM', () => {
    clearInterval(handler)

    server.close(err => {
        if(err){
            logger.error(err.message)
            process.exit(1)
        }
    })
})

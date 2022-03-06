import * as http from 'http';
import * as url from 'url';
import Logger from '../utils/Logger';
import Version, { isDevBuild } from '../utils/Version';
import VersionMetric from './metrics/VersionMetric';
import registry from './Registry';

const version = new Version(process.env.npm_package_version, isDevBuild)
registry.setDefaultLabels({
    app: `asena-v${version.getFullVersion()}`
})

const logger = new Logger('prometheus')
const server = http.createServer(async(req, res) => {
    const route = url.parse(req.url).pathname
    switch(route){
        case '/metrics':
            try{
                res.setHeader('Content-Type', registry.contentType)
                registry.metrics().then(metrics => {
                    res.end(metrics)
                })
            }catch(e){
                res.writeHead(500).end()
            }
            break

        default:
            res.writeHead(404).end()
            break
    }
}).listen(8080, () => {
    logger.info('HTTP server is active. Telemetry data is provided at the /metrics endpoint.')
})

new VersionMetric().observe(version)

// Graceful Shutdown
process.on('SIGTERM', () => {
    server.close(err => {
        if(err){
            logger.error(err.message)
            process.exit(1)
        }
    })
})

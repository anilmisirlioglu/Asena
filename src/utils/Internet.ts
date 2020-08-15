// Basic HTTP operations - Special for use of the bot

import https from 'https'
import http from 'http'

type HttpMethod = 'POST'

interface HttpOptions{
    readonly host: string,
    port?: number
    readonly path: string,
    readonly method: HttpMethod,
    headers: HttpHeaders
}

interface HttpHeaders extends NodeJS.Dict<number | string | string[]>{}

type Writable = {
    [key: string]: string | number | boolean | Writable | Array<string | number | Writable>
}

const request = (options: HttpOptions, chunk: Writable, callback?: (res: http.IncomingMessage) => void) => {
    const toJSON = JSON.stringify(chunk)

    options.headers = Object.assign(options.headers, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(toJSON)
    })

    const request = https.request(options, callback)
    request.write(toJSON)
    request.end()
}

export default request

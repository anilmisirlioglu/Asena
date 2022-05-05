import { Buffer } from 'buffer';
import https from 'https'
import { parse } from 'url'

const ValidURLRegex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$',
    'i'
)

const MagicBytes = [
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
    Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89A
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG
    Buffer.from([0xFF, 0xD8, 0xFF]) // JPG, JPEG
]

export default class Image{

    private readonly url: string

    constructor(url: string){
        this.url = url
    }

    isValidURL(): boolean{
        return !!ValidURLRegex.test(this.url)
    }

    isValidImage(): Promise<boolean>{
        return new Promise<boolean>(resolve => {
            const q = parse(this.url, true);
            const options = {
                path: q.pathname,
                host: q.hostname,
                port: q.port,
                headers: {
                    'Content-Type': 'arraybuffer',
                    'Range': 'bytes=0-7'
                },
                timeout: 2500
            }

            const request = https.get(options, res => {
                const chunks = []

                res.on('data', data => chunks.push(data))
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks)
                    for(const bytes of MagicBytes){
                        if(bytes.equals(buffer.slice(0, bytes.length))){
                            resolve(true)
                        }
                    }

                    resolve(false)
                })
                res.on('error', () => {
                    resolve(false)
                })
            })

            request.on('timeout', () => {
                request.destroy()
                resolve(false)
            })
        })
    }

}
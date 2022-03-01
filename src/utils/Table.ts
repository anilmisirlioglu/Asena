import { Console } from 'console';
import { Transform } from 'stream';

const ts = new Transform({
    transform(chunk, enc, cb){
        cb(null, chunk)
    }
})
const out = new Console({ stdout: ts })

export const table = (data) => {
    out.table(data)
    return (ts.read() || '').toString()
}

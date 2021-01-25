import { Colors } from './TextFormat';

const ASENA_ASCII_ART = `
    /\\                         
   /  \\   ___  ___ _ __   __ _ 
  / /\\ \\ / __|/ _ \\ '_ \\ / _\` |
 / ____ \\\\__ \\  __/ | | | (_| |
/_/    \\_\\___/\\___|_| |_|\\__,_|
`

const isDev = process.env.NODE_ENV !== 'production'

const info = [
    {key: 'OS', value: process.platform},
    {key: 'Arch', value: process.config.variables.host_arch},
    {key: 'NodeJS Version', value: process.version},
    {key: 'Asena Build', value: isDev ? 'Development' : 'Production'},
    {key: 'Asena Version', value: (process.env.npm_package_version || 'Unknown') + (isDev ? '+dev' : '')}
]

const SpaceAfterASCIIArt = 1
const SpaceAfterInfoKey = Math.max(...info.map(item => item.key.length))

const parseAsenaASCIIArt = (): string => {
    const data = ASENA_ASCII_ART.split(/(?:\r\n|\r|\n)/g).filter(line => line !== '')
    if(data.length > 0){
        for(let i = 0; i < data.length; i++){
            const item = info[i]
            data[i] = Colors.AQUA + data[i] + ' '.repeat(SpaceAfterASCIIArt) + Colors.DARK_GRAY + '|' + ' '.repeat(SpaceAfterASCIIArt) + `${
                Colors.RED + item.key + ' '.repeat(SpaceAfterInfoKey - item.key.length)
            }: ${Colors.WHITE + item.value}` + Colors.RESET
        }
    }

    return '\n' + data.join('\n') + '\n'
}

export {
    parseAsenaASCIIArt
}

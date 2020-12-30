import Version from '../utils/Version';

type StringTree = {
    [key: string]: string | string[] | StringTree
}

type Args = Array<string | number>

/** Interface compatible with JSON structure */
interface LanguageInfo{
    version: string
    contributors: string[]
    translator: string
    aliases: string[]
    code: string
    flag: string
    full: string
    strings: StringTree
}

export default class Language{

    /** Language version */
    public version: Version

    /** List of contributors */
    public contributors: string[]

    /** The translator */
    public translator: string

    /** Other nicknames for the language */
    public aliases: string[]

    /** Language code according to IETF (https://wiki.freepascal.org/Language_Codes) */
    public code: string

    /** Flag of language */
    public flag: string

    /** The full name of language */
    public full: string

    /** Language strings */
    public strings: {
        [key: string]: string | string[]
    } = {}

    constructor(info: LanguageInfo){
        this.version = new Version(info.version)
        this.contributors = info.contributors ?? []
        this.translator = info.translator
        this.aliases = info.aliases ?? []
        this.code = info.code
        this.flag = info.flag
        this.full = info.full

        this.decode(info.strings)
    }

    /** Decode key strings */
    decode(object: StringTree, path: string[] = []){
        for(const [k, v] of Object.entries(object)){
            if(!v || typeof v !== 'object' || Array.isArray(v)){
                this.strings[path.concat(k).join('.')] = v as string | string[]
            }else{
                this.decode(v, path.concat(k))
            }
        }
    }

    translate(key: string, args: Args): string{
        let translated = this.strings[key]

        if(Array.isArray(translated)){
            translated = translated.join('\n')
        }

        if(translated && typeof translated === 'string'){
            return this.parseArgs(translated, args)
        }

        return null
    }

    parseArgs(str: string, args: Args): string{
        return str.replace(/{(\d)}/g, (_, i) => (args[parseInt(i)] ?? "error").toString())
    }

}

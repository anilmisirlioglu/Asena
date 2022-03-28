import Version from '../utils/Version';

type StringTree = {
    [key: string]: string | string[] | StringTree
}

type Args = Array<string | number>

/** Interface compatible with JSON structure */
interface LanguageInfo{
    version: string
    contributors: Translator[]
    translator: Translator
    aliases: string[]
    code: string
    flag: string
    full: string
    strings: StringTree
    emoji: string
}

interface Translator{
    name: string
    website: string
    mail: string
}

export default class Language{

    /** Language version */
    public version: Version

    /** List of contributors */
    public contributors: Translator[]

    /** The translator */
    public translator: Translator

    /** Other nicknames for the language */
    public aliases: string[]

    /** Language code according to IETF (https://wiki.freepascal.org/Language_Codes) */
    public code: string

    /** Flag of the language */
    public flag: string

    /** The full name of the language */
    public full: string

    /** Emoji of the language */
    public emoji: string

    /** Language strings */
    public strings: StringTree = {}

    constructor(info: LanguageInfo){
        this.version = new Version(info.version)
        this.contributors = info.contributors ?? []
        this.translator = info.translator
        this.aliases = info.aliases ?? []
        this.code = info.code
        this.flag = info.flag
        this.full = info.full
        this.emoji = info.emoji

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
        const translated = this.strings[key]

        const isArray = Array.isArray(translated)
        if(translated && (isArray || typeof translated === 'string')){
            if(isArray){
                let i = 0
                const parsed = (translated as string[]).map(text => {
                    const match = text.match(/{(\d)}/g)
                    if(match){
                        const slice = args.slice(i, i + match.length)
                        i += match.length

                        return this.parseArgs(text, slice)
                    }

                    return text
                })

                return parsed.join('\n')
            }

            return this.parseArgs(translated as string, args)
        }

        return null
    }

    parseArgs(str: string, args: Args): string{
        return str.replace(/{(\d)}/g, (_, i) => (args[parseInt(i, 10)] ?? "error").toString())
    }

}

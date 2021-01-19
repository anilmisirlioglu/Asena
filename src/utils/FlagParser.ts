type FlagValue = string | number | boolean | undefined

interface IFlag{
    [key: string]: FlagValue
}

const LongFlagPrefix = '--'

const parseFlags = (): IFlag => {
    const flags: IFlag = {}
    for(const argv of process.argv){
        if(argv.startsWith(LongFlagPrefix)){
            const slice = argv.split('=')
            const key = slice[0]
            if(
                slice.length > 0 &&
                typeof key === 'string' &&
                key.length > LongFlagPrefix.length
            ){
                flags[key.slice(LongFlagPrefix.length, key.length)] = castValue(slice[1])
            }
        }
    }

    return flags
}

/**
 * Returns boolean if flag is present and has no value
 * @param flag
 */
const findFlagValue = <T extends FlagValue>(flag: string): T => {
    if(flag.startsWith(LongFlagPrefix)){
        flag = flag.slice(LongFlagPrefix.length, flag.length)
    }

    const find = process.argv.find(argv =>
        argv.trim().slice(LongFlagPrefix.length, argv.length).startsWith(flag) ||
        argv.trim().startsWith(flag)
    )
    if(find){
        const split = find.split('=')
        if(split.length > 1){
            return castValue(split.pop()) as T
        }

        return true as T
    }

    return undefined
}

const castValue = (value): FlagValue => {
    if(value === 'true'){
        return true
    }

    if(value === 'false'){
        return false
    }

    if(!isNaN(value) && !isNaN(parseFloat(value))){
        return Number(value)
    }

    return value
}

export {
    parseFlags,
    findFlagValue,
    castValue
}

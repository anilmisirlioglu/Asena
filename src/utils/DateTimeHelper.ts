import LanguageManager from '../language/LanguageManager';

interface TimeUnits{
    year,
    month,
    week,
    day,
    hour,
    minute,
    second
}

const TimeUnitSeconds = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
}

interface ISecondConvert extends TimeUnits{
    toString(): string
}

const secondsToString = (
    delta: number,
    locale: string = LanguageManager.DEFAULT_LANGUAGE,
    chunk: number = 5
): ISecondConvert => {
    const result: TimeUnits = {
        year: 0,
        month: 0,
        week: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
    }

    Object.keys(TimeUnitSeconds).forEach((key) => {
        result[key] = Math.floor(delta / TimeUnitSeconds[key])
        delta -= result[key] * TimeUnitSeconds[key]
    })

    return Object.assign(result, {
        toString(): string{
            let arr = []
            if(result.year !== 0) arr.push(`${result.year} ${LanguageManager.translate(locale, 'global.date-time.units.year')}`)
            if(result.month !== 0) arr.push(`${result.month} ${LanguageManager.translate(locale, 'global.date-time.units.month')}`)
            if(result.week !== 0) arr.push(`${result.week} ${LanguageManager.translate(locale, 'global.date-time.units.week')}`)
            if(result.day !== 0) arr.push(`${result.day} ${LanguageManager.translate(locale, 'global.date-time.units.day')}`)
            if(result.hour !== 0) arr.push(`${result.hour} ${LanguageManager.translate(locale, 'global.date-time.units.hour')}`)
            if(result.minute !== 0) arr.push(`${result.minute} ${LanguageManager.translate(locale, 'global.date-time.units.minute')}`)
            if(result.second !== 0) arr.push(`${result.second} ${LanguageManager.translate(locale, 'global.date-time.units.second')}`)

            return arr.slice(0, chunk).join(', ')
        }
    })
}

const parseDiscordTimestamp = (d: Date): string => `<t:${(+d / 1000) | 0}>`

const strToSeconds = (text: string): number => {
    const arr = text.match(/([0-9]+)([smhd])/gi)
    if(!arr || arr.length === 0) return 0

    return arr
        .map(decodeAndConvertTimeByUnit)
        .filter(Boolean)
        .reduce((a, b) => a + b, 0)
}

const decodeAndConvertTimeByUnit = (time: string): number | undefined => {
    const type: string = time.slice(-1)
    const value: number = Number(time.slice(0, time.length - 1))

    if(isNaN(value)) return undefined

    let toSecond: number | undefined
    switch(type){
        case 's':
            toSecond = value
            break

        case 'm':
            toSecond = 60 * value
            break

        case 'h':
            toSecond = 60 * 60 * value
            break

        case 'd':
            toSecond = ((60 * 60) * 24) * value
            break
    }

    return toSecond
}

export {
    secondsToString,
    parseDiscordTimestamp,
    strToSeconds,
    decodeAndConvertTimeByUnit
}

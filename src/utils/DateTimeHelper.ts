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

const dateTimeToString = (date: Date, locale = LanguageManager.DEFAULT_LANGUAGE): string => {
    const month = LanguageManager.translate(locale, `global.date-time.months.${(date.getUTCMonth() + 1)}`)

    return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()} ${fillZero(date.getUTCHours())}:${fillZero(date.getUTCMinutes())}:${date.getUTCSeconds()}`
}

const fillZero = (number: number | string): string => {
    number = String(number)
    return number.length === 1 ? `0${number}` : number
}

const detectTime = (time: string): number | undefined => {
    const type: string = time.slice(-1)
    const value: number = Number(time.slice(0, time.length - 1))

    let toSecond: number | undefined
    if(isNaN(value)){
        return undefined
    }

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

const parseObjectDate = object => {
    return new Date(
        object.year,
        object.monthValue,
        object.dayOfMonth,
        object.hour,
        object.minute,
        object.second,
        object.nano
    )
}

export {
    secondsToString,
    dateTimeToString,
    detectTime,
    parseObjectDate
}

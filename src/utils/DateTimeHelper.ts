import LanguageManager from '../language/LanguageManager';

declare interface SecondsToTime{
    readonly d: number
    readonly h: number
    readonly m: number
    readonly s: number
    toString(): string
}

const secondsToTime = ($seconds: number, locale = LanguageManager.DEFAULT_LANGUAGE): SecondsToTime => {
    const secondsInAMinute = 60;
    const secondsInAnHour = 60 * secondsInAMinute;
    const secondsInADay = 24 * secondsInAnHour;

    const days = Math.floor($seconds / secondsInADay);

    const hourSeconds = $seconds % secondsInADay;
    const hours = Math.floor(hourSeconds / secondsInAnHour);

    const minuteSeconds = hourSeconds % secondsInAnHour;
    const minutes = Math.floor(minuteSeconds / secondsInAMinute);

    const remainingSeconds = minuteSeconds % secondsInAMinute;
    const seconds = Math.ceil(remainingSeconds);

    return {
        d: days,
        h: hours,
        m: minutes,
        s: seconds,
        toString(): string{
            let arr = [];
            if(days !== 0){
                arr.push(`${days} ${LanguageManager.translate(locale, 'global.date-time.units.day')}`)
            }

            if(hours !== 0){
                arr.push(`${hours} ${LanguageManager.translate(locale, 'global.date-time.units.hour')}`)
            }

            if(minutes !== 0){
                arr.push(`${minutes} ${LanguageManager.translate(locale, 'global.date-time.units.minute')}`)
            }

            if(seconds !== 0){
                arr.push(`${seconds} ${LanguageManager.translate(locale, 'global.date-time.units.second')}`)
            }

            return arr.join(', ')
        }
    }
}

const getDateTimeToString = (date: Date, locale = LanguageManager.DEFAULT_LANGUAGE): string => {
    const MONTH_ARRAY = LanguageManager.translate(locale, 'global.date-time.months')

    const hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()
    const seconds = date.getUTCSeconds()
    return `${date.getUTCDate()} ${MONTH_ARRAY[date.getUTCMonth()]} ${date.getUTCFullYear()} ${String(hours).length === 1 ? `0${hours}` : hours}:${String(minutes).length === 1 ? `0${minutes}` : minutes}:${String(seconds).length === 1 ? `0${seconds}` : seconds}`
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

export {
    secondsToTime,
    getDateTimeToString,
    detectTime
}

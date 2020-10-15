declare interface SecondsToTime{
    readonly d: number
    readonly h: number
    readonly m: number
    readonly s: number
    toString(): string
}

const MONTH_ARRAY: string[] = [
    'Ocak', 'Şubat', 'Mart',
    'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül',
    'Ekim', 'Kasım', 'Aralık'
]

const secondsToTime = ($seconds: number): SecondsToTime => {
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
                arr.push(`${days} gün`)
            }

            if(hours !== 0){
                arr.push(`${hours} saat`)
            }

            if(minutes !== 0){
                arr.push(`${minutes} dakika`)
            }

            if(seconds !== 0){
                arr.push(`${seconds} saniye`)
            }

            return arr.join(', ')
        }
    }
}

const getDateTimeToString = (date: Date): string => {
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
    secondsToTime,
    getDateTimeToString,
    detectTime,
    parseObjectDate
}

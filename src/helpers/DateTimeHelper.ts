declare interface SecondsToTime{
    readonly d: number,
    readonly h: number,
    readonly m: number,
    readonly s: number
}

export class DateTimeHelper{

    private static MONTH_ARRAY = [
        'Ocak', 'Şubat', 'Mart',
        'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül',
        'Ekim', 'Kasım', 'Aralık'
    ]

    public static formatDate(date: Date){
        return new Intl.DateTimeFormat('tr-TR').format(date);
    }

    public static secondsToTime($seconds: number): SecondsToTime{
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
            s: seconds
        }
    }

    public static getDateToString(date: Date): string{
        return `${date.getUTCDate()} ${this.MONTH_ARRAY[date.getUTCMonth()]} ${date.getUTCFullYear()}`
    }

    public static getDateTimeToString(date: Date): string{
        const hours = date.getUTCHours()
        const minutes = date.getUTCMinutes()
        const seconds = date.getUTCSeconds()
        return `${date.getUTCDate()} ${this.MONTH_ARRAY[date.getUTCMonth()]} ${date.getUTCFullYear()} ${String(hours).length === 1 ? `0${hours}` : hours}:${String(minutes).length === 1 ? `0${minutes}` : minutes}:${String(seconds).length === 1 ? `0${seconds}` : seconds}`
    }

    public static microTime(): number{
        const hrTime: [number, number] = process.hrtime();
        return hrTime[0] * 1000000 + hrTime[1] / 1000;
    }

}
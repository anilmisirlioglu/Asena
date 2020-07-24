class Byte{

    private static readonly symbols: string[] = [
        'Byte',
        'Kilobyte',
        'Megabyte',
        'Gigabyte',
        'Terabyte',
        'PiB',
        'EiB',
        'ZiB',
        'YiB'
    ] // supported symbols

    public static getSymbolByQuantity(bytes: number): string{
        const exp: number = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, Math.floor(exp))).toFixed(2)} ${this.symbols[exp]}`
    }

}

export default Byte

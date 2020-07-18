import { execSync } from 'child_process';

enum Markers{
    ESCAPE = '\xc2\xa7',
    EOL = '\n'
}

export enum Colors{
    BLACK = Markers.ESCAPE + '0',
    DARK_BLUE = Markers.ESCAPE + '1',
    DARK_GREEN = Markers.ESCAPE + '2',
    DARK_AQUA = Markers.ESCAPE + '3',
    DARK_RED = Markers.ESCAPE + '4',
    DARK_PURPLE = Markers.ESCAPE + '5',
    GOLD = Markers.ESCAPE + '6',
    GRAY = Markers.ESCAPE + '7',
    DARK_GRAY = Markers.ESCAPE + '8',
    BLUE = Markers.ESCAPE + '9',
    GREEN = Markers.ESCAPE + 'a',
    AQUA = Markers.ESCAPE + 'b',
    RED = Markers.ESCAPE + 'c',
    LIGHT_PURPLE = Markers.ESCAPE + 'd',
    YELLOW = Markers.ESCAPE + 'e',
    WHITE = Markers.ESCAPE + 'f',

    OBFUSCATED = Markers.ESCAPE + 'k',
    BOLD = Markers.ESCAPE + 'l',
    STRIKETHROUGH = Markers.ESCAPE + 'm',
    UNDERLINE = Markers.ESCAPE + 'n',
    ITALIC = Markers.ESCAPE + 'o',
    RESET = Markers.ESCAPE + 'r'
}

export default class TextFormat{

    public static FORMAT_BOLD: String = "";
    public static FORMAT_OBFUSCATED: String = "";
    public static FORMAT_ITALIC: String = "";
    public static FORMAT_UNDERLINE: String = "";
    public static FORMAT_STRIKETHROUGH: String = "";
    public static FORMAT_RESET: String = "";

    public static COLOR_BLACK: String = "";
    public static COLOR_DARK_BLUE: String = "";
    public static COLOR_DARK_GREEN: String = "";
    public static COLOR_DARK_AQUA: String = "";
    public static COLOR_DARK_RED: String = "";
    public static COLOR_PURPLE: String = "";
    public static COLOR_GOLD: String = "";
    public static COLOR_GRAY: String = "";
    public static COLOR_DARK_GRAY: String = "";
    public static COLOR_BLUE: String = "";
    public static COLOR_GREEN: String = "";
    public static COLOR_AQUA: String = "";
    public static COLOR_RED: String = "";
    public static COLOR_LIGHT_PURPLE: String = "";
    public static COLOR_YELLOW: String = "";
    public static COLOR_WHITE: String = "";

    private static formattingCodes = null;

    public static hasFormattingCodes(): boolean{
        if(this.formattingCodes === null){
            throw new Error('Formatting codes have not been initialized.')
        }

        return this.formattingCodes;
    }

    private static getFallbackEscapeCodes(): void{
        this.FORMAT_BOLD = '\x1b[1m';
        this.FORMAT_OBFUSCATED = '';
        this.FORMAT_ITALIC = '\x1b[3m';
        this.FORMAT_UNDERLINE = '\x1b[4m';
        this.FORMAT_STRIKETHROUGH = '\x1b[9m';

        this.FORMAT_RESET = '\x1b[m';

        this.COLOR_BLACK = '\x1b[0;30m';
        this.COLOR_DARK_BLUE = '\x1b[0;34m';
        this.COLOR_DARK_GREEN = '\x1b[0;32m';
        this.COLOR_DARK_AQUA = '\x1b[0;36m';
        this.COLOR_DARK_RED = '\x1b[0;30m';
        this.COLOR_PURPLE = '\x1b[0;35m';
        this.COLOR_GOLD = '\x1b[38;5;214m';
        this.COLOR_GRAY = '\x1b[0;37m';
        this.COLOR_DARK_GRAY = '\x1b[1;30m';
        this.COLOR_BLUE = '\x1b[1;34m';
        this.COLOR_GREEN = '\x1b[1;32m';
        this.COLOR_AQUA = '\x1b[1;36m';
        this.COLOR_RED = '\x1b[1;31m';
        this.COLOR_LIGHT_PURPLE = '\x1b[1;35m';
        this.COLOR_YELLOW = '\x1b[1;33m';
        this.COLOR_WHITE = '\x1b[1;37m';
    }

    private static getEscapeCodes(): void{
        this.FORMAT_BOLD = execSync(`tput bold`).toString();
        this.FORMAT_OBFUSCATED = execSync(`tput smacs`).toString()
        this.FORMAT_ITALIC = '\x1b[9m' //execSync(`tput sitm`).toString();
        this.FORMAT_UNDERLINE = execSync(`tput smul`).toString();
        this.FORMAT_STRIKETHROUGH = '\x1b[9m'; //`tput `;

        this.FORMAT_RESET = execSync(`tput sgr0`).toString();

        const colors = Number(execSync(`tput colors`));
        if(colors > 8){
            this.COLOR_BLACK = execSync(`tput setaf ${colors >= 256 ? '16' : '0'}`).toString();
            this.COLOR_DARK_BLUE = execSync(`tput setaf ${colors >= 256 ? '19' : '4'}`).toString();
            this.COLOR_DARK_GREEN = execSync(`tput setaf ${colors >= 256 ? '34' : '2'}`).toString();
            this.COLOR_DARK_AQUA = execSync(`tput setaf ${colors >= 256 ? '37' : '6'}`).toString();
            this.COLOR_DARK_RED = execSync(`tput setaf ${colors >= 256 ? '124' : '1'}`).toString();
            this.COLOR_PURPLE = execSync(`tput setaf ${colors >= 256 ? '127' : '5'}`).toString();
            this.COLOR_GOLD = execSync(`tput setaf ${colors >= 256 ? '214' : '3'}`).toString();
            this.COLOR_GRAY = execSync(`tput setaf ${colors >= 256 ? '145' : '7'}`).toString();
            this.COLOR_DARK_GRAY = execSync(`tput setaf ${colors >= 256 ? '59' : '8'}`).toString();
            this.COLOR_BLUE = execSync(`tput setaf ${colors >= 256 ? '63' : '12'}`).toString();
            this.COLOR_GREEN = execSync(`tput setaf ${colors >= 256 ? '83' : '10'}`).toString();
            this.COLOR_AQUA = execSync(`tput setaf ${colors >= 256 ? '87' : '14'}`).toString();
            this.COLOR_RED = execSync(`tput setaf ${colors >= 256 ? '203' : '9'}`).toString();
            this.COLOR_YELLOW = execSync(`tput setaf ${colors >= 256 ? '227' : '11'}`).toString();
            this.COLOR_WHITE = execSync(`tput setaf ${colors >= 256 ? '231' : '15'}`).toString();
        }else{
            this.COLOR_BLACK = this.COLOR_DARK_GRAY = execSync(`tput setaf 0`).toString();
            this.COLOR_RED = this.COLOR_DARK_RED = execSync(`tput setaf 1`).toString();
            this.COLOR_GREEN = this.COLOR_DARK_GREEN = execSync(`tput setaf 2`).toString();
            this.COLOR_YELLOW = this.COLOR_GOLD = execSync(`tput setaf 3`).toString();
            this.COLOR_BLUE = this.COLOR_DARK_BLUE = execSync(`tput setaf 4`).toString();
            this.COLOR_LIGHT_PURPLE = this.COLOR_PURPLE = execSync(`tput setaf 5`).toString();
            this.COLOR_AQUA = this.COLOR_DARK_AQUA = execSync(`tput setaf 6`).toString();
            this.COLOR_GRAY = this.COLOR_WHITE = execSync(`tput setaf 7`).toString();
        }
    }

    public static init(){
        this.formattingCodes = true; // TODO::Detect formatting code support

        switch(process.platform){
            case 'linux':
            case 'freebsd':
            case 'openbsd':
            case 'netbsd':
            case 'darwin':
                this.getEscapeCodes();
                return

            case 'win32':
            case 'android':
                this.getFallbackEscapeCodes();
                return;
        }
    }

    public static isInit(): boolean{
        return this.formattingCodes !== null;
    }

    public static tokenize(string: string): string[]{
        return string.split(new RegExp(`(${Markers.ESCAPE}[0-9a-fk-or])`, 'g'), -1);
    }

    public static clean(string: string, removeFormat: boolean = true): string{
        if(removeFormat){
            return string
                .replace(new RegExp(`${Markers.ESCAPE}[0-9a-fk-or]`, 'g'), '')
                .replace(/\x1b[\\(\\][[0-9;\\[\\(]+[Bm]/g, '')
                .replace(new RegExp(Markers.ESCAPE, 'g'), '')
        }

        return string
            .replace(/\x1b[\\(\\][[0-9;\\[\\(]+[Bm]/g, '')
            .replace('\x1b', '')
    }

    public static toANSI(string: string | string[]): string{
        if(!Array.isArray(string)){
            string = this.tokenize(string);
        }

        let newString = '';
        for(const token of string){
            switch(token){
                case Colors.BOLD.toString():
                    newString += this.FORMAT_BOLD;
                    break;

                case Colors.OBFUSCATED.toString():
                    newString += this.FORMAT_OBFUSCATED;
                    break;

                case Colors.ITALIC.toString():
                    newString += this.FORMAT_ITALIC;
                    break;

                case Colors.UNDERLINE.toString():
                    newString += this.FORMAT_UNDERLINE;
                    break;

                case Colors.STRIKETHROUGH.toString():
                    newString += this.FORMAT_STRIKETHROUGH;
                    break;

                case Colors.RESET.toString():
                    newString += this.FORMAT_RESET;
                    break;

                // Colors
                case Colors.BLACK.toString():
                    newString += this.COLOR_BLACK;
                    break;

                case Colors.DARK_BLUE.toString():
                    newString += this.COLOR_DARK_BLUE;
                    break;

                case Colors.DARK_GREEN.toString():
                    newString += this.COLOR_DARK_GREEN;
                    break;

                case Colors.DARK_AQUA.toString():
                    newString += this.COLOR_DARK_AQUA;
                    break;

                case Colors.DARK_RED.toString():
                    newString += this.COLOR_DARK_RED;
                    break;

                case Colors.DARK_PURPLE.toString():
                    newString += this.COLOR_PURPLE;
                    break;

                case Colors.GOLD.toString():
                    newString += this.COLOR_GOLD;
                    break;

                case Colors.GRAY.toString():
                    newString += this.COLOR_GRAY;
                    break;

                case Colors.DARK_GRAY.toString():
                    newString += this.COLOR_DARK_GRAY;
                    break;

                case Colors.BLUE.toString():
                    newString += this.COLOR_BLUE;
                    break;

                case Colors.GREEN.toString():
                    newString += this.COLOR_GREEN;
                    break;

                case Colors.AQUA.toString():
                    newString += this.COLOR_AQUA;
                    break;

                case Colors.RED.toString():
                    newString += this.COLOR_RED;
                    break;

                case Colors.LIGHT_PURPLE.toString():
                    newString += this.COLOR_LIGHT_PURPLE;
                    break;

                case Colors.YELLOW.toString():
                    newString += this.COLOR_YELLOW;
                    break;

                case Colors.WHITE.toString():
                    newString += this.COLOR_WHITE;
                    break;

                default:
                    newString += token;
                    break;
            }
        }

        return newString;
    }

}
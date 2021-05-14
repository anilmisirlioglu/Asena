import { execSync } from 'child_process';
import InvalidArgumentException from './exceptions/InvalidArgumentException';

/**
 * @link https://semver.org/lang/en/
 */
export default class Version{

    private readonly baseVersion: string;
    private readonly suffix: string;

    private readonly major: number;
    private readonly minor: number;
    private readonly patch: number;

    private readonly development: boolean;
    private readonly build: number;

    constructor(baseVersion: string, isDevBuild: boolean = false, buildNumber: number = 0){
        this.baseVersion = baseVersion;
        this.development = isDevBuild;
        this.build = buildNumber;

        const match = baseVersion.match(/(\d+)\.(\d+)\.(\d+)(?:-(.*))?$/);
        if(match !== null && match.filter(item => item !== undefined).length < 4){
            throw new InvalidArgumentException('Invalid base version, should contain at least 3 version digits (x.y.z)');
        }

        this.major = Number(match[1]);
        this.minor = Number(match[2]);
        this.patch = Number(match[3]);
        this.suffix = match[4] || '';
    }

    public getNumber(): number{
        return ((this.major << 9) | (this.minor << 5) | this.patch);
    }

    public getBaseVersion(): string{
        return this.baseVersion;
    }

    public getFullVersion(build: boolean = false): string{
        let vFull = this.baseVersion;
        if(this.development){
            vFull += '+dev';
            if(build && this.build > 0){
                vFull += `.${this.build}`;
            }
        }

        return vFull;
    }

    public getMajor(): number{
        return this.major;
    }

    public getMinor(): number{
        return this.minor;
    }

    public getPatch(): number{
        return this.patch;
    }

    public getSuffix(): string{
        return this.suffix;
    }

    public getBuild(): number{
        return this.build;
    }

    public isDev(): boolean{
        return this.development;
    }

    public toString = (): string => {
        return this.getFullVersion();
    }

    public getLastUpdate(): string{
        return execSync('git rev-parse HEAD').toString();
    }

    public compare(target: Version, diff: Boolean = false): number{
        const number = this.getNumber();
        const tNumber = target.getNumber();

        if(diff){
            return tNumber - number;
        }

        if(number > tNumber){
            return -1; // Target is older
        }else if(number < tNumber){
            return 1; // Target is newer
        }else if(target.isDev() && !this.isDev()){
            return -1; // Dev builds of the same version are always considered older than a release
        }else if(target.getBuild() > this.getBuild()){
            return 1;
        }else if(target.getBuild() < this.build){
            return -1;
        }else{
            return 0; // Same version
        }
    }
}

export const isDevBuild = process.env.NODE_ENV !== 'production'

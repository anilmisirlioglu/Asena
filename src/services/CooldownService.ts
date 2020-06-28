export default class CooldownService{

    private cooldown: number
    private cooldowns: { [key: string]: number } = {}

    constructor(cooldown: number){
        this.setCooldownTime(cooldown)

        /* cache check looper */
        setInterval(() => {
            for(const key in this.cooldowns){
                if(Date.now() / 1000 > this.cooldowns[key]){
                    this.deleteCooldown(key)
                }
            }
        }, 1000)
    }

    public setCooldownTime(cooldown: number): void{
        this.cooldown = cooldown
    }

    public setCooldown(key: string, cooldown: number = this.cooldown): void{
        this.cooldowns[key] = Date.now() / 1000 + cooldown
    }

    public deleteCooldown(key: string): void{
        delete this.cooldown[key]
    }

    public getCooldown(key: string): number{
        return this.cooldowns[key] ?? 0
    }

    public checkCooldown(key: string): boolean{
        return Date.now() / 1000 > this.getCooldown(key)
    }

}
export default function Premium(constructor: Function){
    constructor.prototype.premium = true
}

export interface ICommandPremium{
    premium: boolean | undefined
}

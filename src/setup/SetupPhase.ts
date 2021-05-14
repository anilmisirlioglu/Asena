import { Message } from 'discord.js';

interface ValidatorCallbackReturnType{
    readonly result: boolean,
    readonly value: any
}

interface ValidatorCallback{
    (message: Message): Promise<ValidatorCallbackReturnType>
}

interface SetupPhaseOptions{
    readonly message: string | string[]
    readonly validator: ValidatorCallback
    readonly skippable: boolean
}

export default class SetupPhase{

    constructor(private readonly options: SetupPhaseOptions){}

    public get message(): string{
        const message = this.options.message
        if(typeof message === 'object'){
            return message.join('\n')
        }

        return message
    }

    public get validator(): ValidatorCallback{
        return this.options.validator
    }

    public get skippable(): boolean{
        return this.options.skippable
    }

}

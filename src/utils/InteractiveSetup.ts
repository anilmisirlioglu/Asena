import { SuperClient } from '../helpers/Helper';
import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import { Collection, Message, TextChannel, User } from 'discord.js';

interface ValidatorCallbackReturnType{
    result: boolean,
    value: any
}

interface ValidatorCallback{
    (message: Message): ValidatorCallbackReturnType
}

type DataStoreType = Collection<number, any>

interface OnFinishCallback{
    (store: DataStoreType): boolean
}

export class SetupPhase{

    public constructor(
        public readonly message: string,
        public readonly validator: ValidatorCallback
    ){}

}

export class InteractiveSetup{

    private currentPhaseIndex: number = 0
    private isItOver: boolean = false
    private cancelKeywords = ['iptal', 'cancel', 'exit']
    private dataStore: DataStoreType = new Collection<number, any>()

    constructor(
        private readonly user: User,
        private readonly channel: TextChannel,
        private readonly client: SuperClient,
        private readonly phases: SetupPhase[],
        private readonly onFinishCallback: OnFinishCallback,
        private readonly timeout: number = 60 * 5
    ){
        if(phases.length === 0){
            throw new InvalidArgumentException('Yetersiz aşama. En az 1 aşama olmalıdır')
        }else{
            this.setPhaseListener()
            this.setTimeoutTimer()
        }
    }

    private setPhaseListener(message: boolean = true): void{
        const phase = this.getCurrentPhase()

        if(message){
            setTimeout(async () => {
                await this.channel.send(phase.message)
            }, 100)
        }

        this.client.once('message', async message => {
            if(message.author.id === this.user.id && message.channel.id === this.channel.id){
                if(!this.isItOver){
                    const content = message.content.trim()
                    if(this.cancelKeywords.indexOf(content) === -1){
                        const validator = phase.validator(message)
                        if(validator.result){
                            this.dataStore.set(this.currentPhaseIndex, validator.value)
                            if(this.getLastPhaseIndex() !== this.currentPhaseIndex){
                                this.currentPhaseIndex++
                                this.setPhaseListener()
                            }else{
                                this.onFinishCallback(this.dataStore)
                                this.isItOver = true
                            }
                        }else{
                            this.setPhaseListener(false)
                        }
                    }else{
                        await this.channel.send('**>>** İnteraktif kurulum sihirbazı iptal edildi.')
                        this.isItOver = true
                    }
                }
            }else{
                this.setPhaseListener(false)
            }
        })
    }

    private setTimeoutTimer(){
        setTimeout(async () => {
            if(!this.isItOver){
                await this.channel.send('**>>** İnteraktif kurulum sihirbazı zaman aşımına uğradı ve kapandı.')
                this.isItOver = true
            }
        }, this.timeout * 1000)
    }

    private getCurrentPhase(): SetupPhase{
        return this.phases[this.currentPhaseIndex]
    }

    private getLastPhaseIndex(): number{
        return this.phases.length - 1
    }

}
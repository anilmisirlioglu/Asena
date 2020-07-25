import { Collection, TextChannel, User } from 'discord.js';
import { SuperClient } from '../Asena';
import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import SetupPhase from './SetupPhase';

type DataStoreType = Collection<number, any>

interface OnFinishCallback{
    (store: DataStoreType): boolean
}

interface InteractiveSetupOptions{
    readonly user: User
    readonly channel: TextChannel
    readonly client: SuperClient
    readonly phases: SetupPhase[]
    readonly onFinishCallback: OnFinishCallback,
    readonly timeout: number | undefined
}

export default class InteractiveSetup{

    private currentPhaseIndex: number = 0
    public isItOver: boolean = false
    private cancelKeywords: string[] = ['iptal', 'cancel', 'exit']
    private dataStore: DataStoreType = new Collection<number, any>()

    public readonly user: User
    public readonly channel: TextChannel
    private readonly client: SuperClient
    private readonly phases: SetupPhase[]
    private readonly onFinishCallback: OnFinishCallback
    private readonly timeout: number

    constructor(options: InteractiveSetupOptions){
        if(options.phases.length === 0){
            throw new InvalidArgumentException('Yetersiz aşama. En az 1 aşama olmalıdır')
        }

        this.user = options.user
        this.channel = options.channel
        this.client = options.client
        this.phases = options.phases
        this.onFinishCallback = options.onFinishCallback
        this.timeout = options.timeout || 60 * 5 // 5 minute
    }

    public start(): void{
        this.client.getSetupManager().addSetup(this)
        this.setPhaseListener()
        this.setTimeoutTiming()
    }

    private setPhaseListener(message: boolean = true): void{
        const phase = this.phases[this.currentPhaseIndex]

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
                                this.client.getSetupManager().deleteSetup(this)
                                this.onFinishCallback(this.dataStore)
                            }
                        }else{
                            this.setPhaseListener(false)
                        }
                    }else{
                        this.client.getSetupManager().deleteSetup(this)
                        await this.channel.send(':boom: İnteraktif kurulum sihirbazı iptal edildi.')
                    }
                }
            }else{
                this.setPhaseListener(false)
            }
        })
    }

    private setTimeoutTiming(){
        setTimeout(async () => {
            if(!this.isItOver){
                this.client.getSetupManager().deleteSetup(this)
                await this.channel.send(':boom: İnteraktif kurulum sihirbazı zaman aşımına uğradı ve kapandı.')
            }
        }, this.timeout * 1000)
    }

    private getLastPhaseIndex(): number{
        return this.phases.length - 1
    }

}

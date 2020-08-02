import { Collection, Snowflake } from 'discord.js';
import { SuperClient } from '../Asena';
import { InvalidArgumentException } from '../exceptions/InvalidArgumentException';
import SetupPhase from './SetupPhase';
import { EventEmitter } from 'events';
import Constants from '../Constants';

type DataStoreType = Collection<number, any>

interface OnFinishCallback{
    (store: DataStoreType): boolean
}

interface InteractiveSetupOptions{
    readonly user_id: Snowflake
    readonly channel_id: Snowflake
    readonly client: SuperClient
    readonly phases: SetupPhase[]
    readonly onFinishCallback: OnFinishCallback,
    readonly timeout: number | undefined
}

export default class InteractiveSetup extends EventEmitter{

    private currentPhaseIndex: number = 0
    public isItOver: boolean = false
    private dataStore: DataStoreType = new Collection<number, any>()
    private timer: NodeJS.Timeout

    public readonly user_id: Snowflake
    public readonly channel_id: Snowflake
    private readonly client: SuperClient
    private readonly phases: SetupPhase[]
    private readonly onFinishCallback: OnFinishCallback
    private readonly timeout: number

    constructor(options: InteractiveSetupOptions){
        super()

        if(options.phases.length === 0){
            throw new InvalidArgumentException('Yetersiz aşama. En az 1 aşama olmalıdır')
        }

        this.user_id = options.user_id
        this.channel_id = options.channel_id
        this.client = options.client
        this.phases = options.phases
        this.onFinishCallback = options.onFinishCallback
        this.timeout = options.timeout || 60 * 5 // 5 minute
    }

    public start(): void{
        this.client.getSetupManager().addSetup(this)
        this.setPhaseListener()
        this.setTimeoutTiming()

        this.emit('start')
    }

    public stop(reason){
        this.client.getSetupManager().deleteSetup(this)
        clearTimeout(this.timer)

        this.emit('stop', reason)
    }

    private setPhaseListener(message: boolean = true): void{
        const phase = this.phases[this.currentPhaseIndex]

        if(message){
            setTimeout(async () => {
                this.emit('message', phase.message)
            }, 100)
        }

        this.client.once('message', async message => {
            if(message.author.id === this.user_id && message.channel.id === this.channel_id){
                if(!this.isItOver){
                    const content = message.content.trim()
                    if(Constants.SETUP_CANCEL_KEYWORDS.indexOf(content) === -1){
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
                        this.stop('İnteraktif kurulum sihirbazı iptal edildi.')
                    }
                }
            }else{
                this.setPhaseListener(false)
            }
        })
    }

    private setTimeoutTiming(){
        this.timer = setTimeout(async () => {
            if(!this.isItOver){
                this.stop('İnteraktif kurulum sihirbazı zaman aşımına uğradı ve kapandı.')
            }
        }, this.timeout * 1000)
    }

    private getLastPhaseIndex(): number{
        return this.phases.length - 1
    }

}

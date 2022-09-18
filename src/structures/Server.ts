import Structure from './Structure';
import ServerModel, { IServer } from '../models/Server';
import Timestamps from '../models/legacy/Timestamps';
import ID from '../models/legacy/ID';
import { Snowflake } from 'discord.js';
import GiveawayManager from '../managers/GiveawayManager';
import Premium from './Premium';
import PremiumModel, { PremiumStatus } from './../models/Premium';
import Language from '../language/Language';
import LanguageManager from '../language/LanguageManager';
import SurveyManager from '../managers/SurveyManager';

type SuperServer = IServer & Timestamps & ID

class Server extends Structure<typeof ServerModel, SuperServer>{

    public server_id: Snowflake
    public premium?: Premium
    public locale: string

    public giveaways: GiveawayManager = new GiveawayManager(this)
    public surveys: SurveyManager = new SurveyManager()

    constructor(data: SuperServer){
        super(ServerModel, data)
    }

    protected patch(data: SuperServer){
        this.server_id = data.server_id
        this.locale = data.locale

        PremiumModel.findOne({
            server_id: this.server_id,
            status: PremiumStatus.CONTINUES
        }).exec().then(async result => {
            if(result){
                const premium = new Premium(result)
                if(premium.hasExpired()){
                    await result.updateOne({ status: PremiumStatus.FINISHED })
                }else{
                    this.premium = premium
                }
            }
        })
    }

    protected identifierKey(): string{
        return 'server_id'
    }

    async setLocale(language: Language){
        await this.update({
            locale: language.code
        })
    }

    translate(key: string, ...args: Array<string | number>): string{
        return LanguageManager.translate(this.locale, key, ...args)
    }

    isPremium(): boolean{
        return this.premium && !this.premium.hasExpired()
    }

}

export default Server

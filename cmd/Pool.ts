import IPool from '../src/utils/Pool';
import Help from './bot/Help';
import ApplicationCommand from './ApplicationCommand';
import Invite from './bot/Invite';
import Ping from './bot/Ping';
import BotInfo from './bot/BotInfo';
import Premium from './server/Premium';
import Locale from './server/Locale';
import Question from './survey/Question';
import Survey from './survey/Survey';
import Giveaways from './giveaway/Giveaways';
import Cancel from './giveaway/Cancel';
import Finish from './giveaway/Finish';
import Fix from './giveaway/Fix';
import ReRoll from './giveaway/ReRoll';
import Soundaway from './giveaway/Soundaway';
import Create from './giveaway/Create';
import Edit from './giveaway/Edit';

export default class Pool extends IPool<ApplicationCommand>{

    protected toMultidimensionalArray(): ApplicationCommand[][]{
        return [
            this.BotCommands,
            this.GiveawayCommands,
            this.ServerCommands,
            this.SurveyCommands
        ]
    }

    private readonly BotCommands = [
        new Help(),
        new Invite(),
        new Ping(),
        new BotInfo()
    ]

    private readonly GiveawayCommands = [
        new Giveaways(),
        new Cancel(),
        new Finish(),
        new Fix(),
        new ReRoll(),
        new Soundaway(),
        new Create(),
        new Edit()
    ]

    private readonly ServerCommands = [
        new Premium(),
        new Locale()
    ]

    private readonly SurveyCommands = [
        new Question(),
        new Survey()
    ]

}
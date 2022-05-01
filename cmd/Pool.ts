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
import Raffles from './raffle/Raffles';
import Cancel from './raffle/Cancel';
import Finish from './raffle/Finish';
import Fix from './raffle/Fix';
import ReRoll from './raffle/ReRoll';
import Soundaway from './raffle/Soundaway';
import Create from './raffle/Create';
import Edit from './raffle/Edit';

export default class Pool extends IPool<ApplicationCommand>{

    protected toMultidimensionalArray(): ApplicationCommand[][]{
        return [
            this.BotCommands,
            this.RaffleCommands,
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

    private readonly RaffleCommands = [
        new Raffles(),
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
import Edit from './raffle/Edit';
import Create from './raffle/Create';
import Cancel from './raffle/Cancel';
import Finish from './raffle/Finish';
import Raffles from './raffle/Raffles';
import ReRoll from './raffle/ReRoll';
import BotInfo from './bot/BotInfo';
import Help from './bot/Help';
import Invitation from './bot/Invitation';
import Locale from './server/Locale';
import Premium from './server/Premium';
import Question from './survey/Question';
import Survey from './survey/Survey';
import Ping from './bot/Ping';
import Soundaway from './raffle/Soundaway';
import Fix from './raffle/Fix';
import Pool from '../utils/Pool';
import Command from './Command';

export default class CommandPool extends Pool<Command>{

    protected toMultidimensionalArray(): Command[][]{
        return [
            this.BotCommands,
            this.RaffleCommands,
            this.ServerCommands,
            this.SurveyCommands
        ]
    }

    private readonly BotCommands = [
        new BotInfo(),
        new Help(),
        new Invitation(),
        new Ping()
    ]

    private readonly RaffleCommands = [
        new Create(),
        new Cancel(),
        new Edit(),
        new Finish(),
        new Fix(),
        new Raffles(),
        new ReRoll(),
        new Soundaway()
    ]

    private readonly ServerCommands = [
        new Locale(),
        new Premium()
    ]

    private readonly SurveyCommands = [
        new Question(),
        new Survey()
    ]

}

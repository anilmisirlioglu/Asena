import Edit from './giveaway/Edit';
import Create from './giveaway/Create';
import Cancel from './giveaway/Cancel';
import Finish from './giveaway/Finish';
import Giveaways from './giveaway/Giveaways';
import ReRoll from './giveaway/ReRoll';
import Fix from './giveaway/Fix';
import Soundaway from './giveaway/Soundaway';
import Ping from './bot/Ping';
import Help from './bot/Help';
import BotInfo from './bot/BotInfo';
import Invitation from './bot/Invitation';
import Locale from './server/Locale';
import Premium from './server/Premium';
import Question from './survey/Question';
import Survey from './survey/Survey';
import Pool from '../utils/Pool';
import Command from './Command';

export default class CommandPool extends Pool<Command>{

    protected toMultidimensionalArray(): Command[][]{
        return [
            this.BotCommands,
            this.GiveawayCommands,
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

    private readonly GiveawayCommands = [
        new Create(),
        new Cancel(),
        new Edit(),
        new Finish(),
        new Fix(),
        new Giveaways(),
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

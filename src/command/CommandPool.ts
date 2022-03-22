import EditRaffle from './raffle/EditRaffle';
import CreateRaffle from './raffle/CreateRaffle';
import CancelRaffle from './raffle/CancelRaffle';
import FinishRaffle from './raffle/FinishRaffle';
import Raffles from './raffle/Raffles';
import ReRollRaffle from './raffle/ReRollRaffle';
import BotInfo from './bot/BotInfo';
import Help from './bot/Help';
import Invitation from './bot/Invitation';
import Locale from './server/Locale';
import Permission from './server/Permission';
import Premium from './server/Premium';
import Question from './survey/Question';
import Survey from './survey/Survey';
import Ping from './bot/Ping';
import Soundaway from './raffle/Soundaway';
import FixRaffle from './raffle/FixRaffle';
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
        new CreateRaffle(),
        new CancelRaffle(),
        new EditRaffle(),
        new FinishRaffle(),
        new FixRaffle(),
        new Raffles(),
        new ReRollRaffle(),
        new Soundaway()
    ]

    private readonly ServerCommands = [
        new Locale(),
        new Permission(),
        new Premium()
    ]

    private readonly SurveyCommands = [
        new Question(),
        new Survey()
    ]

}

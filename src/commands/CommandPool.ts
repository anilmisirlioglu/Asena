import CreateRaffle from './raffle/CreateRaffle';
import CancelRaffle from './raffle/CancelRaffle';
import EndRaffle from './raffle/EndRaffle';
import Raffles from './raffle/Raffles';
import ReRollRaffle from './raffle/ReRollRaffle';
import SetupRaffle from './raffle/SetupRaffle';
import BotInfo from './bot/BotInfo';
import Help from './bot/Help';
import Invitation from './bot/Invitation';
import Locale from './server/Locale';
import SetCommandPermission from './server/SetCommandPermission';
import SetPrefix from './server/SetPrefix';
import Question from './survey/Question';
import Survey from './survey/Survey';
import Command from './Command';
import Ping from './bot/Ping';

export default class CommandPool implements Iterable<Command>{

    *[Symbol.iterator](){
        yield* this.flat(
            this.BOT_COMMANDS,
            this.RAFFLE_COMMANDS,
            this.SERVER_COMMANDS,
            this.SURVEY_COMMANDS
        )
    }

    private *flat(a?: any, ...r: any){
        if(Array.isArray(a)){
            yield* this.flat(...a)
        }else{
            yield a
        }

        if(r.length){
            yield* this.flat(...r)
        }
    }

    private readonly BOT_COMMANDS = [
        new BotInfo(),
        new Help(),
        new Invitation(),
        new Ping()
    ]

    private readonly RAFFLE_COMMANDS = [
        new CreateRaffle(),
        new CancelRaffle(),
        new EndRaffle(),
        new Raffles(),
        new ReRollRaffle(),
        new SetupRaffle()
    ]

    private readonly SERVER_COMMANDS = [
        new Locale(),
        new SetCommandPermission(),
        new SetPrefix()
    ]

    private readonly SURVEY_COMMANDS = [
        new Question(),
        new Survey()
    ]

}

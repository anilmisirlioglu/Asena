import AdvancedCreateRaffle from './raffle/AdvancedCreateRaffle';
import EditRaffle from './raffle/EditRaffle';
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
import Permission from './server/Permission';
import Prefix from './server/Prefix';
import Premium from './server/Premium';
import Question from './survey/Question';
import Vote from './survey/Vote';

export default class CommandPool{

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
        new Invitation()
    ]

    private readonly RAFFLE_COMMANDS = [
        new AdvancedCreateRaffle(),
        new CreateRaffle(),
        new CancelRaffle(),
        new EditRaffle(),
        new EndRaffle(),
        new Raffles(),
        new ReRollRaffle(),
        new SetupRaffle()
    ]

    private readonly SERVER_COMMANDS = [
        new Locale(),
        new Permission(),
        new Prefix(),
        new Premium()
    ]

    private readonly SURVEY_COMMANDS = [
        new Question(),
        new Vote()
    ]

}

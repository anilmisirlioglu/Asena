import { Collection, Snowflake } from 'discord.js';
import InteractiveSetup from './InteractiveSetup';

export default class SetupManager{

    private setups = new Collection<Snowflake, Snowflake>()

    public addSetup(setup: InteractiveSetup): void{
        this.setups.set(setup.user.id, setup.channel.id)
    }

    public deleteSetup(setup: InteractiveSetup): void{
        setup.isItOver = true
        this.setups.delete(setup.user.id)
    }

    public getSetupChannel(user_id: Snowflake): Snowflake | undefined{
        return this.setups.get(user_id)
    }

    public inSetup(user_id: Snowflake): boolean{
        return this.getSetupChannel(user_id) !== undefined
    }

}

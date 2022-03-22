import { Collection } from 'discord.js';
import InteractionPool from './InteractionPool';
import { GenericInteraction } from './Interaction';
import Logger from '../utils/Logger';

type InteractionMap = Collection<string, GenericInteraction>

export default class InteractionManager{

    private logger: Logger = new Logger('actions')

    private interactions: InteractionMap = new Collection<string, GenericInteraction>()

    constructor(){
        this.registerAllInteractions()
    }

    public registerAllInteractions(): void{
        for(const interaction of new InteractionPool()){
            this.registerInteraction(interaction)
        }

        this.logger.info(`Total ${this.interactions.size} interaction successfully loaded.`)
    }

    public registerInteraction(interaction: GenericInteraction){
        this.interactions.set(interaction.identifier, interaction)
    }

    public getInteraction(identifier: string): GenericInteraction | undefined{
        return this.interactions.get(identifier)
    }

}
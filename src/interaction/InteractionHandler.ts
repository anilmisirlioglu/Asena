import { Interaction } from 'discord.js';
import InteractionManager from './InteractionManager';
import InteractionDescriptor from './InteractionDescriptor';
import Factory from '../Factory';

export default class InteractionHandler extends Factory{

    private readonly interactionManager = new InteractionManager()

    execute(interaction: Interaction){
        /** COMMAND INTERACTIONS */
        if(interaction.isCommand()){
            this.getClient().getCommandHandler().run(interaction).then(void 0)
        }

        let customId
        if(interaction.isButton() || interaction.isSelectMenu()){
            customId = interaction.customId
        }

        if(!customId){
            return
        }

        const descriptor = InteractionDescriptor.decode(customId)
        if(!descriptor){
            return
        }

        const action = this.interactionManager.getInteraction(descriptor.identifier)
        if(action && action.actions.includes(descriptor.action)){
            action.execute(interaction, descriptor.action)
        }
    }

}
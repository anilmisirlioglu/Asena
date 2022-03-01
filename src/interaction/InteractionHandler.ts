import { Interaction } from 'discord.js';
import InteractionManager from './InteractionManager';
import InteractionDescriptor from './InteractionDescriptor';

export default class InteractionHandler{

    private readonly interactionManager = new InteractionManager()

    execute(interaction: Interaction){
        if(interaction.isCommand()){
            // COMMAND INTERACTIONS
            // TODO::forward to command handler
        }

        let customId
        if(interaction.isButton()){
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
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
            this.client.servers.get(interaction.guildId).then(async server => {
                if(server){
                    server = await this.client.servers.create({ server_id: interaction.guildId })
                }

                action.execute(server, interaction, descriptor.action)
            })
        }
    }

}
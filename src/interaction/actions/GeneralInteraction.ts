import Interaction, { Action } from '../Interaction';
import { ButtonInteraction } from 'discord.js';
import Server from '../../structures/Server';

export default class GeneralInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'general',
            actions: ['cancel']
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        switch(action.key){
            case 'cancel':
                return interaction.update({
                    content: interaction.message.content,
                    components: []
                })
        }
    }

}
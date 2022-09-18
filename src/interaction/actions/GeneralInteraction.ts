import Interaction, { Action } from '../Interaction';
import { ButtonInteraction } from 'discord.js';
import Server from '../../structures/Server';
import { Actions } from './enums';

export default class GeneralInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'general',
            actions: [Actions.General.Cancel]
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        switch(action.key){
            case Actions.General.Cancel:
                return interaction.update({
                    content: interaction.message.content,
                    components: []
                })
        }
    }

}
import Interaction, { Action } from '../Interaction';
import { ButtonInteraction } from 'discord.js';
import Server from '../../structures/Server';
import { Actions } from './enums';
import { SurveyAnswer } from '../../models/Survey';

export default class SurveyInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'survey',
            actions: [
                SurveyAnswer.True,
                SurveyAnswer.False,
                Actions.Survey.Attendees
            ]
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        server.surveys.get(interaction.message.id).then(async survey => {
            if(!survey) return

            if(action.key == Actions.Survey.Attendees){
                return interaction.reply({
                    files: [survey.toAttachment()],
                    ephemeral: true
                })
            }

            const userId = interaction.user.id
            const answer = action.key == SurveyAnswer.True ? SurveyAnswer.True : SurveyAnswer.False
            const reply = await survey.isReplied(answer, userId)
            if(reply){
                return interaction.reply({
                    content: server.translate('structures.survey.already'),
                    ephemeral: true
                })
            }

            survey.reply(answer, userId).then(() => {
                interaction.update({
                    components: [survey.buildComponents(server)]
                })
            })
        })
    }

}
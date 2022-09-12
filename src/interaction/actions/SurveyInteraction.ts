import Interaction, { Action } from '../Interaction';
import { ButtonInteraction } from 'discord.js';
import { SurveyAnswer } from '../../models/Survey';
import Server from '../../structures/Server';

export default class SurveyInteraction extends Interaction<ButtonInteraction>{

    constructor(){
        super({
            identifier: 'survey',
            actions: [
                SurveyAnswer.TRUE,
                SurveyAnswer.FALSE,
                'attendees'
            ]
        })
    }

    async execute(server: Server, interaction: ButtonInteraction, action: Action){
        server.surveys.get(interaction.message.id).then(async survey => {
            if(!survey) return

            if(action.key == 'attendees'){
                return interaction.reply({
                    files: [survey.toAttachment()],
                    ephemeral: true
                })
            }

            const userId = interaction.user.id
            const answer = action.key == SurveyAnswer.TRUE ? SurveyAnswer.TRUE : SurveyAnswer.FALSE
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
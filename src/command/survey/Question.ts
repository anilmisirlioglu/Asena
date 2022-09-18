import Command, { Group, Result } from '../Command'
import SuperClient from '../../SuperClient'
import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js'
import { LETTERS, ILetter, MAX_ANSWER_LENGTH } from '../../Constants'
import regional from '../../utils/RegionalIndicator'
import Server from '../../structures/Server'

export default class Question extends Command{

    constructor(){
        super({
            name: 'question',
            group: Group.Poll,
            description: 'commands.survey.question.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: [
                'question: your cool question answers: foo|bar|baz',
                'question: 1 + 1 answers: 2|1'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const question = action.options.getString('question', true)
        const answers = action.options.getString('answers', true).split('|')

        if(answers.length > MAX_ANSWER_LENGTH){
            return this.error('commands.survey.question.max.answer', MAX_ANSWER_LENGTH)
        }

        let i: number = 0
        const emojis: ILetter[] = []
        const embed = new EmbedBuilder()
            .setTitle(question)
            .setDescription(answers
                .map(answer => {
                    const emoji = LETTERS[i++]
                    emojis.push(emoji)

                    return `${regional`${emoji.name}`}  ${answer}`
                })
                .join('\n\n')
            )
            .setColor('#5DADE2')

        action.channel.send({ embeds: [embed] }).then(vote => {
            emojis.map(item => vote.react(item.emoji))

            action.reply({
                content: server.translate('commands.survey.question.successfully'),
                ephemeral: true
            })
        }).catch(async () => {
            await action.reply(':boom: ' + server.translate('commands.survey.question.error'))
        })

        return null
    }

}

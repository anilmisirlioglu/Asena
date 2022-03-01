import Structure from './Structure';
import SurveyModel, { AnswerMap, ISurvey, SurveyAnswer } from './../models/Survey'
import Timestamps from '../models/legacy/Timestamps';
import ID from '../models/legacy/ID';
import {
    ColorResolvable,
    GuildChannel,
    Message,
    MessageActionRow,
    MessageAttachment,
    MessageButton,
    MessageEmbed,
    Snowflake,
    TextChannel
} from 'discord.js';
import { Emojis } from '../Constants';
import SuperClient from '../SuperClient';
import Server from './Server';
import { table } from '../utils/Table';

type SuperSurvey = ISurvey & Timestamps & ID

class Survey extends Structure<typeof SurveyModel, SuperSurvey>{

    public server_id: Snowflake
    public channel_id: Snowflake
    public message_id: Snowflake
    public title: string
    public finishAt: Date
    public answers: AnswerMap

    constructor(data: SuperSurvey){
        super(SurveyModel, data)
    }

    protected identifierKey(): string{
        return 'message_id'
    }

    protected patch(data: SuperSurvey){
        this.server_id = data.server_id
        this.channel_id = data.channel_id
        this.message_id = data.message_id
        this.title = data.title
        this.finishAt = data.finishAt

        if(!(data.answers instanceof Map)){
            data.answers = new Map<SurveyAnswer, string[]>(Object.entries(data.answers) as [SurveyAnswer, string[]][])
        }

        for(const key of Object.values(SurveyAnswer)){
            if(!data.answers.has(key)){
                data.answers.set(key, [])
            }
        }

        this.answers = data.answers
    }

    public async finish(client: SuperClient, server: Server){
        const channel: GuildChannel | undefined = await client.fetchChannel(this.server_id, this.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(this.message_id)
            if(message instanceof Message){
                const [agreeCount, disagreeCount] = [this.countTrueAnswers(), this.countFalseAnswers()]

                const embed = new MessageEmbed()
                    .setColor(this.detectColor(agreeCount, disagreeCount))
                    .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                    .setFooter(server.translate('structures.survey.results.vote'))
                    .setTimestamp()
                    .setTitle(this.title)
                    .addField(`<a:yes:${Emojis.AGREE_EMOJI_ID}> (${server.translate('global.yes')})`, agreeCount.toString(), true)
                    .addField(`<a:no:${Emojis.DISAGREE_EMOJI_ID}> (${server.translate('global.no')})`, disagreeCount.toString(), true)

                await Promise.all([
                    message.delete(),
                    message.channel.send({
                        content: `${Emojis.RUBY_EMOJI} **${server.translate('structures.survey.results.survey')}**`,
                        embeds: [embed]
                    })
                ])
            }
        }
    }

    private detectColor(agreeCount: number, disagreeCount: number): ColorResolvable{
        return agreeCount > disagreeCount ? 'GREEN' : (agreeCount === disagreeCount ? 'YELLOW' : 'RED')
    }

    public isReplied(answer: SurveyAnswer, userId: Snowflake): Promise<boolean>{
        if(this.answers.get(answer).includes(userId)){
            return Promise.resolve(true)
        }

        return SurveyModel.exists({
            [`answers.${answer}`]: {
                $in: [userId]
            },
            message_id: this.message_id
        })
    }

    public reply(answer: SurveyAnswer, userId: Snowflake){
        return this.update({
            message_id: this.message_id,
            $push: {
                [`answers.${answer}`]: userId
            },
            $pull: {
                [`answers.${this.reverseAnswer(answer)}`]: {
                    $in: [userId]
                }
            },
        })
    }

    public toAttachment(): MessageAttachment{
        const attendees = this.countTrueAnswers() + this.countFalseAnswers()
        const arr = [
            `Asena | Attendees Output`,
            `------------------------`,
            `Start Date: ${this.createdAt.toDateString()} (UTC)`,
            `Finish Date: ${this.finishAt.toString()} (UTC)`,
            `Title: ${this.title}`,
            `Total Attendees: ${attendees}`,
            `------------------------`,
        ]

        if(attendees > 0){
            const data = []
            this.answers.forEach((stack, type) => {
                stack.forEach(item => {
                    data.push({userId: item, answer: type})
                })
            })

            arr.push(`Attendees: `, table(data))
        }

        const buffer = Buffer.from(arr.join('\n'))
        return new MessageAttachment(buffer, `attendees_${this.message_id}.txt`)
    }

    private reverseAnswer = (answer: SurveyAnswer): SurveyAnswer => answer == SurveyAnswer.TRUE ? SurveyAnswer.FALSE : SurveyAnswer.TRUE

    public static buildComponents(server: Server, countTrueAnswers: number = 0, countFalseAnswers: number = 0): MessageActionRow{
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`survey:${SurveyAnswer.TRUE}`)
                    .setLabel(`(${countTrueAnswers}) ${server.translate('global.yes')}`)
                    .setStyle('SUCCESS')
                    .setEmoji('<a:yes:721180088686870549>'),
                new MessageButton()
                    .setCustomId(`survey:${SurveyAnswer.FALSE}`)
                    .setLabel(`(${countFalseAnswers}) ${server.translate('global.no')}`)
                    .setStyle('DANGER')
                    .setEmoji('<a:no:721179958378233887>'),
                new MessageButton()
                    .setCustomId(`survey:attendees`)
                    .setLabel(server.translate('structures.survey.attendees'))
                    .setStyle('PRIMARY')
                    .setEmoji('<a:nitro:736983658803626044>')
            )
    }

    public buildComponents = (server: Server): MessageActionRow => Survey.buildComponents(server, this.countTrueAnswers(), this.countFalseAnswers())

    private countTrueAnswers = (): number => this.answers.get(SurveyAnswer.TRUE).length
    private countFalseAnswers = (): number => this.answers.get(SurveyAnswer.FALSE).length

}

export default Survey

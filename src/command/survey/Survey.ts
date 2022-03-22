import Command, { Group } from '../Command';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Emojis, SurveyLimits } from '../../Constants';
import SuperClient from '../../SuperClient';
import { secondsToString, strToSeconds } from '../../utils/DateTimeHelper';
import Server from '../../structures/Server';
import SurveyX from '../../structures/Survey';

const AGREE = `<a:yes:${Emojis.AGREE_EMOJI_ID}>`
const DISAGREE = `<a:no:${Emojis.DISAGREE_EMOJI_ID}>`

export default class Survey extends Command{

    constructor(){
        super({
            name: 'survey',
            group: Group.POLL,
            description: 'commands.survey.vote.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'title: Lorem Ipsum time: 1m',
                'title: Survey Title time: 1h2m',
                'title: Hello World'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        const title = action.options.getString('title', true)
        const time = action.options.getString('time', false)
        if(time){
            const seconds = strToSeconds(time)
            if(seconds == 0){
                await action.reply({
                    embeds: [this.getErrorEmbed(server.translate('commands.survey.vote.time.invalid'))]
                })

                return true
            }

            if(seconds < SurveyLimits.MIN_TIME || seconds > SurveyLimits.MAX_TIME){
                await action.reply({
                    embeds: [this.getErrorEmbed(server.translate('commands.survey.vote.time.exceeded'))]
                })

                return true
            }

            const embed = new MessageEmbed()
                .setAuthor(action.guild.name, action.guild.iconURL())
                .setColor('#ffd1dc')
                .setDescription(`<a:checkmark:764367612246753290> ${server.translate('commands.survey.vote.embed.description')}`)
                .setFooter(`${server.translate('commands.survey.vote.embed.footer')}: ${secondsToString(seconds, server.locale).toString()}`)
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), title, true)

            action.channel.send({ embeds: [embed], components: [SurveyX.buildComponents(server)] }).then($message => {
                server.surveys.create({
                    server_id: $message.guild.id,
                    channel_id: $message.channel.id,
                    message_id: $message.id,
                    title: title,
                    finishAt: new Date(Date.now() + (seconds * 1000)),
                }).then(async survey => {
                    if(!survey){
                        await Promise.all([
                            $message.delete(),
                            action.reply(':boom: ' + server.translate('commands.survey.vote.error'))
                        ])
                    }
                })
            })
        }else{
            const embed = new MessageEmbed()
                .setAuthor(action.guild.name, action.guild.iconURL())
                .setColor('#E74C3C')
                .setDescription(server.translate('commands.survey.vote.embed.description'))
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), title, true)//args.join(' ')

            action.channel.send({ embeds: [embed] }).then(async vote => {
                await Promise.all([
                    vote.react(AGREE),
                    vote.react(DISAGREE)
                ])
            })
        }

        await action.reply({
            content: server.translate('commands.survey.vote.successfully'),
            ephemeral: true
        })

        return true
    }

}

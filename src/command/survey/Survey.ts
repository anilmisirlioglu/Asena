import Command, { Group } from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import { Emojis, SurveyLimits } from '../../Constants';
import SuperClient from '../../SuperClient';
import SurveyModel from '../../models/Survey';
import { secondsToString, strToSeconds } from '../../utils/DateTimeHelper';
import Server from '../../structures/Server';

export default class Survey extends Command{

    constructor(){
        super({
            name: 'survey',
            group: Group.POLL,
            aliases: ['anket', 'voting', 'vote'],
            description: 'commands.survey.vote.description',
            usage: 'commands.survey.vote.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                '1m Lorem Ipsum',
                '1h2m Foo Bar',
                'Infinity Survey Title'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const AGREE = `<a:yes:${Emojis.AGREE_EMOJI_ID}>`;
        const DISAGREE = `<a:no:${Emojis.DISAGREE_EMOJI_ID}>`;

        if(args.length < 1) return false
        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        const arg0 = args[0]
        const seconds = strToSeconds(arg0)
        if(seconds > 0){
            if(!args[1]) return false

            if(seconds < SurveyLimits.MIN_TIME || seconds > SurveyLimits.MAX_TIME){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.survey.vote.time.exceeded'))
                })

                return true
            }

            const title = args.slice(1, args.length).join(' ')
            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setColor('#ffd1dc')
                .setDescription(server.translate('commands.survey.vote.embed.description'))
                .setFooter(`${server.translate('commands.survey.vote.embed.footer')}: ${secondsToString(seconds, server.locale).toString()}`)
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), title, true)

            message.channel.send({ embed }).then(async $message => {
                const survey = await SurveyModel.create({
                    server_id: $message.guild.id,
                    channel_id: $message.channel.id,
                    message_id: $message.id,
                    title: title,
                    finishAt: new Date(Date.now() + (seconds * 1000))
                })
                let promises
                if(!survey){
                    promises = [
                        $message.delete(),
                        message.channel.send(':boom: ' + server.translate('commands.survey.vote.error'))
                    ]
                }else{
                    promises = [
                        $message.react(AGREE),
                        $message.react(DISAGREE)
                    ]
                }

                await Promise.all(promises)
            })
        }else{
            const embed = new MessageEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setColor('#E74C3C')
                .setDescription(server.translate('commands.survey.vote.embed.description'))
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), args.join(' '), true)

            await message.channel.send({ embed }).then(async vote => {
                await Promise.all([
                    vote.react(AGREE),
                    vote.react(DISAGREE)
                ])
            })
        }

        return true
    }

}

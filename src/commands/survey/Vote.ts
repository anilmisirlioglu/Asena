import Command from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import Constants from '../../Constants';
import SuperClient from '../../SuperClient';
import Survey from '../../models/Survey';
import { detectTime, secondsToTime } from '../../utils/DateTimeHelper';
import Server from '../../structures/Server';

export default class Vote extends Command{

    constructor(){
        super({
            name: 'survey',
            aliases: ['anket', 'anketoluştur', 'startvote', 'voting', 'vote'],
            description: 'commands.survey.vote.description',
            usage: 'commands.survey.vote.usage',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const AGREE = Constants.AGREE_EMOJI_ID;
        const DISAGREE = Constants.DISAGREE_EMOJI_ID;

        if(args.length <= 1) return false

        const second = args[0]
        delete args[0]

        if(!isNaN(Number(second))){
            if(Number(second) !== -1) return false

            const embed = new MessageEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setColor('#E74C3C')
                .setDescription(server.translate('commands.survey.vote.embed.description'))
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), args.filter(arg => arg !== undefined).join(' '), true)

            if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
                await message.delete({
                    timeout: 0
                })
            }
            await message.channel
                .send({ embed })
                .then(async vote => {
                    await vote.react(AGREE);
                    await vote.react(DISAGREE);
                })
        }else{
            const time = detectTime(second)
            if(!time){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.survey.vote.time.invalid'))
                })

                return true
            }

            if(time < Constants.MIN_SURVEY_TIME || time > Constants.MAX_SURVEY_TIME){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.survey.vote.time.exceeded'))
                })

                return true
            }

            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setColor('#ffd1dc')
                .setDescription(server.translate('commands.survey.vote.embed.description'))
                .setFooter(`${server.translate('commands.survey.vote.embed.footer')}: ${secondsToTime(time).toString()}`)
                .setTimestamp()
                .addField(server.translate('commands.survey.vote.embed.fields.question'), args.filter(arg => arg !== undefined).join(' '), true)

            if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
                await message.delete({
                    timeout: 0
                })
            }
            message.channel.send({ embed }).then(async $message => {
                const survey = await Survey.create({
                    server_id: $message.guild.id,
                    channel_id: $message.channel.id,
                    message_id: $message.id,
                    title: args.filter(arg => arg !== undefined).join(' '),
                    finishAt: new Date(Date.now() + (time * 1000))
                })
                if(!survey){
                    await $message.delete()
                    await message.channel.send(':boom: ' + server.translate('commands.survey.vote.error'))
                }else{
                    await $message.react(AGREE)
                    await $message.react(DISAGREE)
                }
            })
        }

        return true
    }

}

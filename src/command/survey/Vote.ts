import Command from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import { Emojis, SurveyLimits } from '../../Constants';
import SuperClient from '../../SuperClient';
import Survey from '../../models/Survey';
import { detectTime, secondsToTime } from '../../utils/DateTimeHelper';
import Server from '../../structures/Server';

export default class Vote extends Command{

    constructor(){
        super({
            name: 'survey',
            aliases: ['anket', 'anketoluştur', 'startvote', 'voting', 'vote'],
            description: 'İki seçenekli oylama anketi oluşturur.',
            usage: '[süre(1m | 1h) | -1(süresiz)] [oylama metni]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const AGREE = Emojis.AGREE_EMOJI_ID;
        const DISAGREE = Emojis.DISAGREE_EMOJI_ID;

        if(args.length <= 1) return false

        const second = args[0]
        delete args[0]

        if(!isNaN(Number(second))){
            if(Number(second) !== -1) return false

            const embed = new MessageEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setColor('#E74C3C')
                .setDescription('Oylama başladı!')
                .setTimestamp()
                .addField('Soru', args.filter(Boolean).join(' '), true)

            if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
                await message.delete({
                    timeout: 0
                })
            }
            await message.channel
                .send({ embed })
                .then(async vote => {
                    await Promise.all([
                        vote.react(AGREE),
                        vote.react(DISAGREE)
                    ])
                })
        }else{
            const time = detectTime(second)
            if(!time){
                await message.channel.send({
                    embed: this.getErrorEmbed('Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)')
                })

                return true
            }

            if(time < SurveyLimits.MIN_TIME || time > SurveyLimits.MAX_TIME){
                await message.channel.send({
                    embed: this.getErrorEmbed(`Anket süresi en az 1 dakika, maksimum 15 gün olabilir.`)
                })

                return true
            }

            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setColor('#ffd1dc')
                .setDescription('Oylama başladı!')
                .setFooter(`Süre: ${secondsToTime(time).toString()}`)
                .setTimestamp()
                .addField('Soru', args.filter(Boolean).join(' '), true)

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
                    title: args.filter(Boolean).join(' '),
                    finishAt: new Date(Date.now() + (time * 1000))
                })
                let promises
                if(!survey){
                    promises = [
                        $message.delete(),
                        message.channel.send(':boom: Anket verisi veritabanına kaydedilemediği için iptal edildi.')
                    ]
                }else{
                    promises = [
                        $message.react(AGREE),
                        $message.react(DISAGREE)
                    ]
                }

                await Promise.all(promises)
            })
        }

        return true
    }

}

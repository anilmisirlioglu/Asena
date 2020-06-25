import { Command } from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import Constants from '../../Constants';
import { SuperClient } from '../../Asena';
import Survey from '../../models/Survey';
import { DateTimeHelper } from '../../helpers/DateTimeHelper';

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

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
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
                .setDescription('Oylama başladı!')
                .setTimestamp()
                .addField('Soru', args.filter(arg => arg !== undefined).join(' '), true)

            await message.delete({ timeout: 0 })
            await message.channel
                .send({ embed })
                .then(async vote => {
                    await vote.react(AGREE);
                    await vote.react(DISAGREE);
                })
        }else{
            const time = DateTimeHelper.detectTime(second)
            if(!time){
                await message.channel.send({
                    embed: this.getErrorEmbed('Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)')
                })

                return true
            }

            if(time < Constants.MIN_SURVEY_TIME || time > Constants.MAX_SURVEY_TIME){
                await message.channel.send({
                    embed: this.getErrorEmbed(`Anket süresi en az 1 dakika, maksimum 7 gün olabilir.`)
                })

                return true
            }

            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setColor('#ffd1dc')
                .setDescription('Oylama başladı!')
                .setFooter(`Süre: ${DateTimeHelper.secondsToTime(time).toString()}`)
                .setTimestamp()
                .addField('Soru', args.filter(arg => arg !== undefined).join(' '), true)

            await message.delete({ timeout: 0 })
            message.channel
                .send({ embed })
                .then(async $message => {
                    const survey = await Survey.create({
                        server_id: $message.guild.id,
                        channel_id: $message.channel.id,
                        message_id: $message.id,
                        title: args.filter(arg => arg !== undefined).join(' '),
                        finishAt: new Date(Date.now() + time)
                    })

                    if(!survey){
                        await $message.delete()
                        await message.channel.send(':boom: Anket verisi veritabanına kaydedilemediği için iptal edildi.')
                    }else{
                        await $message.react(AGREE)
                        await $message.react(DISAGREE)
                    }
                })
        }

        return true
    }

}
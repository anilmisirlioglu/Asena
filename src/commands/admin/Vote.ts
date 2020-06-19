import { Command } from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import { Constants } from '../../Constants';
import { SuperClient } from '../../Asena';

export class Vote extends Command{

    constructor(){
        super({
            name: 'vote',
            aliases: ['anket', 'anketoluştur', 'startvote', 'voting'],
            description: 'İki seçenekli oylama anketi oluşturur.',
            usage: '[süre(saniye) | -1] [oylama metni]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const AGREE = Constants.AGREE_EMOJI_ID;
        const DISAGREE = Constants.DISAGREE_EMOJI_ID;

        if(args.length <= 1) return false

        const second = parseInt(args[0])

        if(second !== -1){
            if(!second || second <= 0) return false

            if(second > (60 * 60)){
                await message.channel.send({
                    embed: client.helpers.message.getErrorEmbed('Oylama süresi maksimum 60 dakika olabilir.')
                })

                return true;
            }
        }

        await message.delete({
            timeout: 0
        })
        delete args[0]

        if(second > 0){
            const time = second * 1000;
            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setColor('#ffd1dc')
                .setDescription('Oylama başladı!')
                .setFooter(`Süre: ${second >= 60 ? `${Math.ceil(second / 60)} dakika, ${second % 60} saniye` : `${second} saniye`}`)
                .setTimestamp()
                .addField('Soru', args.filter(arg => arg !== undefined).join(' '), true)

            const vote = await message.channel.send({ embed })

            await vote.react(AGREE);
            await vote.react(DISAGREE);

            const reactions = await vote.awaitReactions(
                reaction => reaction.emoji.id === AGREE || reaction.emoji.id === DISAGREE,
                { time }
            )

            let agreeCount, disagreeCount

            try{
                agreeCount = reactions.get(AGREE).count - 1
            }catch(e){
                agreeCount = 0
            }

            try{
                disagreeCount = reactions.get(DISAGREE).count - 1
            }catch(e){
                disagreeCount = 0
            }

            await vote.delete({
                timeout: 0
            })

            let color;
            if(agreeCount > disagreeCount){
                color = 'GREEN'
            }else if(agreeCount === disagreeCount){
                color = 'YELLOW'
            }else{
                color = 'RED'
            }

            const resultEmbed = new MessageEmbed()
                .setColor(color)
                .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .setFooter('Oylama sonuçları')
                .setTimestamp()
                .setTitle(args.filter(arg => arg !== undefined).join(' '))
                .addField(`<a:yes:${AGREE}> (Evet)`, agreeCount, true)
                .addField(`<a:no:${DISAGREE}> (Hayır)`, disagreeCount, true)

            await message.channel.send(`${Constants.RUBY_EMOJI} **ANKET SONUÇLARI**`, {
                embed: resultEmbed
            })
        }else{
            const embed = new MessageEmbed()
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setColor('#E74C3C')
                .setDescription('Oylama başladı!')
                .setTimestamp()
                .addField('Soru', args.filter(arg => arg !== undefined).join(' '), true)

            await message.channel
                .send({ embed })
                .then(async vote => {
                    await vote.react(AGREE);
                    await vote.react(DISAGREE);
                })
        }

        return true;
    }

}
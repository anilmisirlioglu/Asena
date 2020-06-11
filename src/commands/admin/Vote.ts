import { Command } from '../Command';
import { Message, MessageEmbed } from 'discord.js';
import { Constants } from '../../Constants';
import { SuperClient } from '../../Asena';

export class Vote extends Command{

    constructor(){
        super(
            'vote',
            ['anket', 'anketoluştur', 'startvote', 'voting'],
            'İki seçenekli oylama anketi oluşturur.',
            '[süre(saniye)] [oylama metni]',
            'ADMINISTRATOR'
        );
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const AGREE = "✔";
        const DISAGREE = "✖";

        if(args.length <= 1) return false

        const second = parseInt(args[0])

        if(!second || second <= 0) return false

        if(second > (60 * 60)){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Oylama süresi maksimum 60 dakika olabilir.')
            })

            return true;
        }

        await message.delete({
            timeout: 0
        })
        delete args[0]

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
            reaction => reaction.emoji.name === AGREE || reaction.emoji.name === DISAGREE,
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
            .addField(`\`${AGREE}\` (Evet)`, agreeCount, true)
            .addField(`\`${DISAGREE}\` (Hayır)`, disagreeCount, true)

        await message.channel.send(`${Constants.GRAPH_EMOJI} **ANKET SONUÇLARI** ${Constants.GRAPH_EMOJI}`, {
            embed: resultEmbed
        })

        return true;
    }

}
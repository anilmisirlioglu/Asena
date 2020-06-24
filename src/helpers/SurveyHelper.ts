import Helper from './Helper';
import { ISurvey } from '../models/Survey';
import { ColorResolvable, GuildChannel, Message, MessageEmbed, MessageReaction, TextChannel } from 'discord.js';
import Constants from '../Constants';

export class SurveyHelper extends Helper{

    public async finishSurvey(survey: ISurvey){
        const channel: GuildChannel | undefined = await this.client.getChannelHelper().fetchChannel(survey.server_id, survey.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(survey.message_id)
            if(message instanceof Message){
                const reactions = await Promise.all(
                    [Constants.AGREE_EMOJI_ID, Constants.DISAGREE_EMOJI_ID].map(async emoji => {
                        const reaction: MessageReaction = await message.reactions.cache.get(emoji)
                        const fetch = await reaction.users.fetch()

                        return fetch.size - 1
                    })
                )

                const { agreeCount, disagreeCount } = {
                    agreeCount: reactions[0],
                    disagreeCount: reactions[1]
                }

                const embed = new MessageEmbed()
                    .setColor(this.detectColor(agreeCount, disagreeCount))
                    .setAuthor(message.author.username, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                    .setFooter('Oylama sonuçları')
                    .setTimestamp()
                    .setTitle(survey.title)
                    .addField(`<a:yes:${Constants.AGREE_EMOJI_ID}> (Evet)`, agreeCount, true)
                    .addField(`<a:no:${Constants.DISAGREE_EMOJI_ID}> (Hayır)`, disagreeCount, true)

                await message.delete({ timeout: 0 })
                await message.channel.send(`${Constants.RUBY_EMOJI} **ANKET SONUÇLARI**`, {
                    embed
                })
            }
        }
    }

    private detectColor(agreeCount: number, disagreeCount: number): ColorResolvable{
        if(agreeCount > disagreeCount){
            return 'GREEN'
        }else if(agreeCount === disagreeCount){
            return 'YELLOW'
        }else{
            return 'RED'
        }
    }

}
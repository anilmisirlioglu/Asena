import Structure from './Structure';
import SurveyModel, { ISurvey } from './../models/Survey'
import Timestamps from '../models/legacy/Timestamps';
import ID from '../models/legacy/ID';
import {
    ColorResolvable,
    GuildChannel,
    Message,
    MessageEmbed,
    MessageReaction,
    Snowflake,
    TextChannel
} from 'discord.js';
import { Emojis } from '../Constants';
import SuperClient from '../SuperClient';
import Server from './Server';

type SuperSurvey = ISurvey & Timestamps & ID

class Survey extends Structure<typeof SurveyModel, SuperSurvey>{

    public server_id: Snowflake
    public channel_id: Snowflake
    public message_id: Snowflake
    public title: string
    public finishAt: Date

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
    }

    public async finish(client: SuperClient, server: Server){
        const channel: GuildChannel | undefined = await client.fetchChannel(this.server_id, this.channel_id)
        if(channel instanceof TextChannel){
            const message: Message | undefined = await channel.messages.fetch(this.message_id)
            if(message instanceof Message){
                const reactions = await Promise.all(
                    [Emojis.AGREE_EMOJI_ID, Emojis.DISAGREE_EMOJI_ID].map(async emoji => {
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
        if(agreeCount > disagreeCount){
            return 'GREEN'
        }else if(agreeCount === disagreeCount){
            return 'YELLOW'
        }else{
            return 'RED'
        }
    }

}

export default Survey

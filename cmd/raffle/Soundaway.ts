import ApplicationCommand from '../ApplicationCommand';
import { ChannelType } from 'discord-api-types/v9';

export default class Soundaway extends ApplicationCommand{

    build(){
        this.setName('soundaway')
        this.setDescription('Starts quick giveaway between those found in the determined (or all) voice channel')
        this.addIntegerOption(option => option.setName('winners').setDescription('The number of winners').setRequired(true))
        this.addStringOption(option => option.setName('title').setDescription('Giveaway title'))
        this.addUserOption(option => option.setName('user').setDescription('If the user represents the giveaway is determined as the voice channel in which the user is located'))
        this.addChannelOption(option => option.setName('channel').setDescription('If the channel represents, the giveaway is determined as a voice channel').addChannelTypes(ChannelType.GuildVoice))
    }

}
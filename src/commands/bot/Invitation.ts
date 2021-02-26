import Command from '../Command';
import SuperClient from '../../SuperClient';
import { Message, MessageEmbed } from 'discord.js';
import Server from '../../structures/Server';

export default class Invitation extends Command{

    private static INVITE_URL: string = 'https://discord.com/oauth2/authorize?permissions=347200&scope=bot&client_id=716259870910840832&redirect_uri=https%3A%2F%2Fdiscord.gg%2FCRgXhfs&response_type=code'
    private static SUPPORT_SERVER: string = 'https://discord.gg/CRgXhfs'
    private static WEBSITE: string = 'https://asena.xyz'

    constructor(){
        super({
            name: 'davet',
            aliases: ['invite', 'party', 'davetiye', 'link'],
            description: 'commands.bot.invitation.description',
            usage: null,
            permission: undefined,
            examples: []
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed = new MessageEmbed()
            .setAuthor(SuperClient.NAME, SuperClient.AVATAR)
            .addField(`:rainbow:  **${server.translate('commands.bot.invitation.bot.url')}:**`, `[${server.translate('commands.bot.invitation.click.invite')}](${Invitation.INVITE_URL})`)
            .addField(`<:hayalet:739432632030593105>  **${server.translate('commands.bot.invitation.support.server')}:**`, `[${server.translate('commands.bot.invitation.click.join')}](${Invitation.SUPPORT_SERVER})`)
            .addField(`:earth_americas:  **${server.translate('commands.bot.invitation.website')}:**`, `[asena.xyz](${Invitation.WEBSITE})`)
            .setColor(message.guild.me.displayHexColor)

        await message.channel.send({ embed })
        return true
    }

}

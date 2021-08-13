import { Guild, MessageEmbed, WebhookClient } from 'discord.js';
import { parseDiscordTimestamp } from './utils/DateTimeHelper';

export default class SyntaxWebhook extends WebhookClient{

    constructor(){
        super({
            id: process.env.WEBHOOK_ID,
            token: process.env.WEBHOOK_TOKEN
        })
    }

    public async resolveGuild(guild: Guild, isCreate: boolean = true): Promise<void>{
        const owner = await guild.fetchOwner()
        const embed = new MessageEmbed()
            .setAuthor(`${isCreate ? 'Yeni Sunucuya Eklendi' : 'Sunucudan Silindi'}`, guild.iconURL() ?? guild.bannerURL())
            .setDescription([
                `Sunucu: **${guild.name}**`,
                `Sunucu ID: **${guild.id}**`,
                `Sunucu Sahibi: **${owner ? owner.displayName : 'Bilinmiyor.'}**`,
                `Sunucu Sahibi ID: **${guild.ownerId}**`,
                `Üye Sayısı: **${guild.memberCount}**`,
                `Sunucu Kurulma Tarihi: **${parseDiscordTimestamp(guild.createdAt)}**`
            ].join('\n'))
            .setColor(isCreate ? 'GREEN' : 'RED')
            .setTimestamp()

        await this.send({ embeds: [embed] })
    }

}

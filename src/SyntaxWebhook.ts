import { Guild, MessageEmbed, WebhookClient } from "discord.js";
import { dateTimeToString } from './utils/DateTimeHelper';

export default class SyntaxWebhook extends WebhookClient{

    constructor(){
        super(
            process.env.WEBHOOK_ID,
            process.env.WEBHOOK_TOKEN
        )
    }

    public resolveGuild(guild: Guild, isCreate: boolean = true): void{
        const embed = new MessageEmbed()
            .setAuthor(`${isCreate ? 'Yeni Sunucuya Eklendi' : 'Sunucudan Silindi'}`, guild.iconURL() ?? guild.bannerURL())
            .setDescription([
                `Sunucu: **${guild.name}**`,
                `Sunucu ID: **${guild.id}**`,
                `Sunucu Sahibi: **${guild.owner ? guild.owner.displayName : 'Bilinmiyor.'}**`,
                `Sunucu Sahibi ID: **${guild.ownerID}**`,
                `Üye Sayısı: **${guild.memberCount}**`,
                `Sunucu Kurulma Tarihi: **${dateTimeToString(guild.createdAt)}**`
            ])
            .setColor(isCreate ? 'GREEN' : 'RED')
            .setTimestamp()

        // noinspection JSIgnoredPromiseFromCall
        this.send({
            embeds: [
                embed
            ]
        })
    }

}

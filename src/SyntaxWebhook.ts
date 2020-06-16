import { Guild, MessageEmbed, WebhookClient } from "discord.js";
import { DateTimeHelper } from './helpers/DateTimeHelper';

export default class SyntaxWebHook extends WebhookClient{

    constructor(){
        super(
            process.env.WEBHOOK_ID,
            process.env.WEBHOOK_TOKEN
        )
    }

    public resolveGuild(guild: Guild, isCreate: boolean = true): void{
        const embed = new MessageEmbed()
            .setAuthor(`${isCreate ? 'Yeni Sunucuya Eklendi' : 'Sunucudan Silindi'}`, guild.iconURL() ?? guild.bannerURL())
            .setDescription(
                [
                    `Sunucu: **${guild.name}**`,
                    `Sunucu ID: **${guild.id}**`,
                    `Sunucu Sahibi: **${guild.owner.displayName}**`,
                    `Sunucu Sahibi ID: **${guild.ownerID}**`,
                    `Üye Sayısı: **${guild.members.cache.size}**`,
                    `Sunucu Kurulma Tarihi: **${DateTimeHelper.getDateTimeToString(guild.createdAt)}**`
                ].join('\n')
            )
            .setColor(isCreate ? 'GREEN' : 'RED')
            .setTimestamp()

        this.send({
            embeds: [embed]
        }).then(() => { /* Ok */ })
    }

}
import Command from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message, MessageEmbed } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';

export default class Locale extends Command{

    constructor(){
        super({
            name: 'locale',
            aliases: ['lang', 'language', 'dil'],
            description: 'Botun varsayılan dilini değiştirir.',
            usage: '[list | set | reset] <args>',
            permission: 'ADMINISTRATOR'
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        if(args.length === 0){
            const language = LanguageManager.getLanguage(server.locale)
            await message.channel.send(`🌎  Botun sunucu içerisindeki iletişim dili: ${language.flag} **${language.full}** - **${language.code} v${language.version}**`)
            return true
        }

        const embed = new MessageEmbed().setColor('GREEN')
        const subCommand = args[0].trim().toLowerCase()
        switch(subCommand){
            case 'list':
                const description = LanguageManager.getLanguages().map(language => {
                    const text = `${language.flag} ${language.full} - ${language.code} v${language.version}`
                    return server.locale === language.code ? `**~ ${text}**` : `**~**  ${text}`
                })

                embed
                    .setAuthor(`🗣️ Kullanılabilir Diller`)
                    .setFooter(`Kullanmak İçin: ${server.prefix}locale set [dil]`)
                    .setDescription(description)

                await message.channel.send(embed)
                break

            case 'set':
                if(args.length < 2){
                    await message.channel.send({
                        embed: this.getErrorEmbed('Lütfen bir dil kodu girin.')
                    })
                    return true
                }

                const code = args[1]
                const locale = LanguageManager.findLanguage(code)
                if(!locale){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`Dil bulunamadı (${code}). Lütfen geçerli bir dil kodu girin.`)
                    })
                }else{
                    await Promise.all([
                        server.setLocale(locale),
                        message.channel.send(`🌈  Varsayılan diliniz **${locale.flag} ${locale.full}** olarak ayarlandı.`)
                    ])
                }
                break

            case 'reset':
                if(server.locale == LanguageManager.DEFAULT_LANGUAGE){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`Zaten varsayılan dili kullanılıyorsunuz.`)
                    })
                }else{
                    const locale = LanguageManager.getLanguage(LanguageManager.DEFAULT_LANGUAGE)
                    await Promise.all([
                        server.setLocale(locale),
                        message.channel.send(`🌈  Varsayılan diliniz **${locale.flag} ${locale.full}** olarak ayarlandı.`)
                    ])
                }
                break

            default:
                return false
        }

        return true
    }

}

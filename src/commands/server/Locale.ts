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
            await message.channel.send(`🌎  ${server.translate('commands.server.locale.default')}: ${language.flag} **${language.full}** - **${language.code} v${language.version}**`)
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
                    .setAuthor(`🗣️ ${server.translate('commands.server.locale.available')}`)
                    .setFooter(server.translate('commands.server.locale.usage', server.prefix))
                    .setDescription(description)

                await message.channel.send(embed)
                break

            case 'set':
                if(args.length < 2){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.enter.code'))
                    })
                    return true
                }

                const code = args[1]
                const locale = LanguageManager.findLanguage(code)
                if(!locale){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.not.found', code))
                    })
                }else{
                    await Promise.all([
                        server.setLocale(locale),
                        message.channel.send('🌈  ' + server.translate('commands.server.locale.language.default.successfully.changed', `${locale.flag} ${locale.full}`))
                    ])
                }
                break

            case 'reset':
                if(server.locale == LanguageManager.DEFAULT_LANGUAGE){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.default.already.using'))
                    })
                }else{
                    const locale = LanguageManager.getLanguage(LanguageManager.DEFAULT_LANGUAGE)
                    await Promise.all([
                        server.setLocale(locale),
                        message.channel.send('🌈  ' + server.translate('commands.server.locale.language.default.successfully.changed', `${locale.flag} ${locale.full}`))
                    ])
                }
                break

            default:
                return false
        }

        return true
    }

}

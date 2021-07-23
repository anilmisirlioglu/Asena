import Command, { Group } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message, MessageEmbed } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';

export default class Locale extends Command{

    constructor(){
        super({
            name: 'locale',
            group: Group.SERVER,
            aliases: ['lang', 'language', 'dil'],
            description: 'commands.server.locale.description',
            usage: 'commands.server.locale.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                'list',
                'reset',
                'set en',
                'set tr'
            ]
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
                    .setAuthor(`🗣️ ${server.translate('commands.server.locale.embed.title')}`)
                    .setFooter(server.translate('commands.server.locale.embed.footer', server.prefix))
                    .setDescription(description)

                await message.channel.send(embed)
                break

            case 'set':
                if(args.length < 2){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.enter.code'))
                    })
                    break
                }

                const code = args[1]
                const locale = LanguageManager.findLanguage(code)
                if(!locale){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.not.found', code))
                    })
                    break
                }

                if(locale.code == server.locale){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.server.locale.language.already.using', locale.full))
                    })
                    break
                }

                await Promise.all([
                    server.setLocale(locale),
                    message.channel.send('🌈  ' + locale.translate('commands.server.locale.language.default.successfully.changed', [`${locale.flag} ${locale.full}`]))
                ])
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
                        message.channel.send('🌈  ' + locale.translate('commands.server.locale.language.default.successfully.changed', [`${locale.flag} ${locale.full}`]))
                    ])
                }
                break

            default:
                return false
        }

        return true
    }

}

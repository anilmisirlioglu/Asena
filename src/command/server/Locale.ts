import Command, { Group } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';

export default class Locale extends Command{

    constructor(){
        super({
            name: 'locale',
            group: Group.SERVER,
            description: 'commands.server.locale.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'sub:list',
                'sub:reset',
                'sub:current',
                'sub:set code: Türkçe',
                'sub:set code: English'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        const embed = new MessageEmbed().setColor('GREEN')
        switch(action.options.getSubcommand(true)){
            case 'current':
                const language = LanguageManager.getLanguage(server.locale)
                await action.reply(`🌎  ${server.translate('commands.server.locale.default')}: ${language.flag} **${language.full}** - **${language.code} v${language.version}**`)
                break

            case 'list':
                const description = LanguageManager.getLanguages().map(language => {
                    const text = `${language.flag} ${language.full} - ${language.code} v${language.version}`
                    return server.locale === language.code ? `**~ ${text}**` : `**~**  ${text}`
                })

                embed
                    .setAuthor(`🗣️ ${server.translate('commands.server.locale.embed.title')}`)
                    .setFooter(server.translate('commands.server.locale.embed.footer'))
                    .setDescription(description.join('\n'))

                await action.reply({ embeds: [embed] })
                break

            case 'set':
                const code = action.options.getString('code', true)
                const locale = LanguageManager.findLanguage(code)
                if(!locale){
                    await action.reply({
                        embeds: [this.getErrorEmbed(server.translate('commands.server.locale.language.not.found', code))]
                    })
                    break
                }

                if(locale.code == server.locale){
                    await action.reply({
                        embeds: [this.getErrorEmbed(server.translate('commands.server.locale.language.already.using', locale.full))]
                    })
                    break
                }

                await Promise.all([
                    server.setLocale(locale),
                    action.reply('🌈  ' + locale.translate('commands.server.locale.language.default.successfully.changed', [`${locale.flag} ${locale.full}`]))
                ])
                break

            case 'reset':
                if(server.locale == LanguageManager.DEFAULT_LANGUAGE){
                    await action.reply({
                        embeds: [this.getErrorEmbed(server.translate('commands.server.locale.language.default.already.using'))]
                    })
                }else{
                    const locale = LanguageManager.getLanguage(LanguageManager.DEFAULT_LANGUAGE)
                    await Promise.all([
                        server.setLocale(locale),
                        action.reply('🌈  ' + locale.translate('commands.server.locale.language.default.successfully.changed', [`${locale.flag} ${locale.full}`]))
                    ])
                }
                break

            default:
                return false
        }

        return true
    }

}

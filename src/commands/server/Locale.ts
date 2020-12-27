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
        // List - Set - Reset - Now
        if(args.length === 0){
            const language = LanguageManager.getLanguage(server.locale)
            await message.channel.send(`🌎  Botun sunucu içerisindeki iletişim dili: ${language.flag} **${language.full}** - **${language.code} v${language.version}**`)
            return true
        }

        //const embed = new MessageEmbed().setColor('GREEN')
        const subCommand = args[0].trim().toLowerCase()
        switch(subCommand){
            case 'list':
                break

            case 'set':
                break

            case 'reset':
                break

            default:
                return false
        }

        return true
    }

}

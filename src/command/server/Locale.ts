import Command, { Group, Result } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { CommandInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';

export default class Locale extends Command{

    constructor(){
        super({
            name: 'locale',
            group: Group.SERVER,
            description: 'commands.server.locale.description',
            permission: 'ADMINISTRATOR',
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const row = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('locale:locale')
                .addOptions(LanguageManager.getLanguages().map(language => {
                    return {
                        label: language.full,
                        value: language.code,
                        emoji: language.emoji,
                        default: language.code == server.locale
                    }
                }))
            )

        await action.reply({ components: [row] })
        return null
    }

}

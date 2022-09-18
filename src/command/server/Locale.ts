import Command, { Group, Result } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { ActionRowBuilder, ChatInputCommandInteraction, PermissionsBitField, SelectMenuBuilder } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';
import { Actions } from '../../interaction/actions/enums';

export default class Locale extends Command{

    constructor(){
        super({
            name: 'locale',
            group: Group.SERVER,
            description: 'commands.server.locale.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const row = new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(new SelectMenuBuilder()
                .setCustomId(`locale:${Actions.Locale.Locale}`)
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

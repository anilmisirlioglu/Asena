import Interaction, { Action } from '../Interaction';
import { SelectMenuInteraction } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';
import Server from '../../structures/Server';

export default class LocaleInteraction extends Interaction<SelectMenuInteraction>{

    constructor(){
        super({
            identifier: 'locale',
            actions: ['locale']
        })
    }

    async execute(server: Server, interaction: SelectMenuInteraction, action: Action){
        const language = LanguageManager.findLanguage(interaction.values[0])
        await Promise.all([
            server.setLocale(language),
            interaction.update({
                content: '🌈  ' + language.translate('commands.server.locale.language.default.successfully.changed', [`${language.flag} ${language.full}`]),
                components: []
            })
        ])
    }

}
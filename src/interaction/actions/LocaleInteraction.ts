import Interaction from '../Interaction';
import { SelectMenuInteraction } from 'discord.js';
import LanguageManager from '../../language/LanguageManager';

export default class LocaleInteraction extends Interaction<SelectMenuInteraction>{

    constructor(){
        super({
            identifier: 'locale',
            actions: ['locale']
        })
    }

    async execute(interaction: SelectMenuInteraction, action: string){
        const server = await this.client.servers.get(interaction.guildId)
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
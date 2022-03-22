import ApplicationCommand from '../ApplicationCommand';

export default class Premium extends ApplicationCommand{

    build(): void{
        this.setName('locale')
        this.setDescription('Asena language settings.')
        this.addSubcommand(cmd => cmd.setName('current').setDescription('Returns the currently selected language'))
        this.addSubcommand(cmd => cmd.setName('list').setDescription('Returns supported languages'))
        this.addSubcommand(cmd => cmd.setName('reset').setDescription('Returns the language to the default language'))
        this.addSubcommand(cmd => cmd.setName('set').setDescription('Changes the bot language in guild').addStringOption(option =>
            option.setName('code').setDescription('Language code').setRequired(true).setChoices([
                ['Türkçe', 'tr'],
                ['English', 'en']
            ])
        ))
    }

}
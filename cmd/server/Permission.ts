import ApplicationCommand from '../ApplicationCommand';

export default class Permission extends ApplicationCommand{

    build(){
        this.setName('permission')
        this.setDescription('Change command usage permissions')
        this.addStringOption(option => option.setName('state').setDescription('Open or Close command usage permissions to everyone').setRequired(true).setChoices([
            ['everyone', 'everyone'],
            ['admin', 'admin']
        ]))
        this.addStringOption(option => option.setName('command').setDescription('Command Name').setRequired(true))
    }

}
import ApplicationCommand from '../ApplicationCommand';

export default class Help extends ApplicationCommand{

    build(){
        this.setName('help')
        this.setDescription('Responds with a list of commands you can use, and information about Asena')
        this.addStringOption(option => option.setName('command').setDescription('The sub command you want to see the help menu'))
    }

}
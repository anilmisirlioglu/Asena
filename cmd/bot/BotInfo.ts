import ApplicationCommand from '../ApplicationCommand';

export default class BotInfo extends ApplicationCommand{

    build(){
        this.setName('botinfo')
        this.setDescription('Returns the technical information about the Asena')
    }

}
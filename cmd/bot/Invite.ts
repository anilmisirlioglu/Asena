import ApplicationCommand from '../ApplicationCommand';

export default class Invite extends ApplicationCommand{

    build(){
        this.setName('invite')
        this.setDescription('Gives the bot\'s invitation link')
    }

}
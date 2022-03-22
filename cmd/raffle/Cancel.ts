import ApplicationCommand from '../ApplicationCommand';

export default class Cancel extends ApplicationCommand{

    build(){
        this.setName('cancel')
        this.setDescription('Cancels a continued giveaway')
        this.addStringOption(option => option.setName('message').setDescription('Giveaway message ID'))
    }

}
import ApplicationCommand from '../ApplicationCommand';

export default class Fix extends ApplicationCommand{

    build(){
        this.setName('fix')
        this.setDescription('Troubleshooting about an unending but a giveaway that should end')
        this.addStringOption(option => option.setName('message').setDescription('Giveaway message ID'))
    }

}
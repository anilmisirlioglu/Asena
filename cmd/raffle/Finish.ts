import ApplicationCommand from '../ApplicationCommand';

export default class Finish extends ApplicationCommand{

    build(){
        this.setName('finish')
        this.setDescription('Finishes a continued giveaway early')
        this.addStringOption(option => option.setName('message').setDescription('Giveaway message ID'))
    }

}
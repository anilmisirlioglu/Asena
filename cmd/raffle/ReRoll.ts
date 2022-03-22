import ApplicationCommand from '../ApplicationCommand';

export default class ReRoll extends ApplicationCommand{

    build(){
        this.setName('reroll')
        this.setDescription('Re-pull the winners')
        this.addStringOption(option => option.setName('message').setDescription('Giveaway message ID'))
        this.addIntegerOption(option => option.setName('winners').setDescription('Number of winners to be re-pulled (if is not presented, re-pulls all winners)'))
    }

}
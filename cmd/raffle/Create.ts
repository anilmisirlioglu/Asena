import ApplicationCommand from '../ApplicationCommand';

export default class Create extends ApplicationCommand{

    build(){
        this.setName('create')
        this.setDescription('Starts a new cool giveaway 🎉')
        this.addIntegerOption(option => option.setName('winners').setDescription('The number of winners').setRequired(true))
        this.addStringOption(option => option.setName('prize').setDescription('Giveaway prize (or title)').setRequired(true))
        this.addStringOption(option => option.setName('time').setDescription('Duration of giveaway (e.g: 1m, 2m2h3s, 5h, 1d)').setRequired(true))
        this.addStringOption(option => option.setName('color').setDescription('Giveaways embed color (e.g: RED, #EB4034)'))
        this.addStringOption(option => option.setName('servers').setDescription('Invitations of the servers that the member must participate in order to participate in the giveaway'))
        this.addStringOption(option => option.setName('reward-roles').setDescription('Reward roles of giveaway (e.g: @Role,Asena,712450379773771887)'))
        this.addStringOption(option => option.setName('allowed-roles').setDescription('The roles that the member must have in order to participate in the giveaway (e.g: @Role,Asena)'))
    }

}
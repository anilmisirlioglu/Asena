import ApplicationCommand from '../ApplicationCommand';

export default class Edit extends ApplicationCommand{

    build(){
        this.setName('edit')
        this.setDescription('Changes the giveaway options (Premium)')
        this.addStringOption(option => option.setName('option').setDescription('Giveaway option for editing').setRequired(true).setChoices([
            ['color', 'color'],
            ['prize', 'prize'],
            ['time', 'time'],
            ['winners', 'winners'],
            ['reward-roles', 'reward-roles'],
        ]))
        this.addStringOption(option => option.setName('operator').setDescription('This option will only be used for winners and reward-options').setRequired(true).setChoices([
            ['+', '+'],
            ['-', '-']
        ]))
        this.addStringOption(option => option.setName('value').setDescription('Selected options new value').setRequired(true))
        this.addStringOption(option => option.setName('giveaway').setDescription('Giveaway message ID for specific giveaway'))
    }

}
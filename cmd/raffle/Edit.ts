import ApplicationCommand from '../ApplicationCommand';

export default class Edit extends ApplicationCommand{

    build(){
        this.setName('edit')
        this.setDescription('Changes the giveaway options (Premium)')
        this.addStringOption(option => option.setName('option').setDescription('Giveaway option for editing').setRequired(true).setChoices(
            { name: 'color', value: 'color' },
            { name: 'prize', value: 'prize' },
            { name: 'time', value: 'time' },
            { name: 'winners', value: 'winners' },
            { name: 'reward-roles', value: 'reward-roles' },
            { name: 'banner', value: 'banner' }
        ))
        this.addStringOption(option => option.setName('value').setDescription('Selected options new value').setRequired(true))
        this.addStringOption(option => option.setName('giveaway').setDescription('Giveaway message ID for specific giveaway'))
        this.addStringOption(option => option.setName('operator').setDescription('This option will only be used for time and reward-options').setChoices(
            { name: '+', value: '+' },
            { name: '-', value: '-' }
        ))
    }

}
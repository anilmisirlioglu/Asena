import ApplicationCommand from '../ApplicationCommand';

export default class Survey extends ApplicationCommand{

    build(){
        this.setName('survey')
        this.setDescription('Starts a new survey')
        this.addStringOption(option => option.setName('title').setDescription('Survey text (or title)').setRequired(true))
        this.addStringOption(option => option.setName('time').setDescription('Duration of survey (e.g: 1h2m, 5h, 1d)'))
    }

}
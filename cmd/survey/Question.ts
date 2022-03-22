import ApplicationCommand from '../ApplicationCommand';

export default class Question extends ApplicationCommand{

    build(){
        this.setName('question')
        this.setDescription('Ask a question in guild')
        this.addStringOption(option => option.setName('question').setDescription('The question you would like to ask').setRequired(true))
        this.addStringOption(option => option.setName('answers').setDescription('The answers of your question (format: Answer 1|Answer 2|Answer 3)').setRequired(true))
    }

}
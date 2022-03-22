import ApplicationCommand from '../ApplicationCommand';

export default class Premium extends ApplicationCommand{

    build(): void{
        this.setName('premium')
        this.setDescription('Returns the Asena Premium subscription information')
    }

}
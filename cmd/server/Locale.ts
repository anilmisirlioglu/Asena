import ApplicationCommand from '../ApplicationCommand';

export default class Premium extends ApplicationCommand{

    build(): void{
        this.setName('locale')
        this.setDescription('Asena language settings.')
    }

}
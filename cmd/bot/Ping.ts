import ApplicationCommand from '../ApplicationCommand';

export default class Ping extends ApplicationCommand{

    build(){
        this.setName('ping')
        this.setDescription('Returns the latency between Asena and Discord APIs')
    }

}
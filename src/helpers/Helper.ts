import { SuperClient } from '../Asena';

export default abstract class Helper{

    constructor(protected readonly client: SuperClient){}

    protected getClient(): SuperClient{
        return this.client
    }

}
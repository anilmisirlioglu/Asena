import { SuperClient } from '../Asena';

export default abstract class Manager{

    constructor(protected readonly client: SuperClient){}

    protected getClient(): SuperClient{
        return this.client
    }

}
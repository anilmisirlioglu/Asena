import { Exception } from './Exception';

export class InvalidArgumentException extends Exception{
    constructor(public message: string){
        super();
    }
}
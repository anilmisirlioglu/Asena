import Exception from './Exception';

class InvalidArgumentException extends Exception{

    constructor(private readonly error: string){
        super(error);
    }

    public getError = (): string => this.error;

}

export default InvalidArgumentException

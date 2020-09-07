class Exception extends Error{

    constructor(message: string){
        super(message)

        Object.setPrototypeOf(this, Exception.prototype)
    }

}

export default Exception

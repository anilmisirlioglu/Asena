class Exception{
    constructor(){
        Error.apply(this, arguments)
    }
}

Exception.prototype = new Error();

export {
    Exception
}
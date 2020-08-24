declare global{
    interface String{
        removeWhiteSpaces(): string
    }

    interface Array<T>{
        checkIfDuplicateExists(): boolean
    }
}

export {}

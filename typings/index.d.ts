declare global{
    interface String{
        removeWhiteSpaces(): string
        toTitleCase(): string
    }

    interface Array<T>{
        checkIfDuplicateExists(): boolean
        intersection(items: T[]): T[]
        difference(items: T[]): T[]
    }
}

export {}

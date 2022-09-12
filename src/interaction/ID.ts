export default class ID{

    private identifier: string
    private action: string
    private data: Map<string, string>

    constructor(
        identifier: string = undefined,
        action: string = undefined,
        data: [string, string][] = []
    ){
        this.identifier = identifier
        this.action = action
        this.data = new Map<string, string>(data)
    }

    setIdentifier(identifier: string): ID{
        this.identifier = identifier
        return this
    }

    setAction(action: string): ID{
        this.action = action
        return this
    }

    addKVPair(key: string, value: string): ID{
        this.data.set(key, value)
        return this
    }

    toString(): string{
        let s = `${this.identifier}:${this.action}`

        const list = []
        if(this.data.size > 0){
            for(const [key, value] of this.data.entries()){
                list.push(`${key}=${value}`)
            }

            s += `?${list.join('&')}`
        }

        return s
    }
}
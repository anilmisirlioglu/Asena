interface InteractionIdentifier{
    readonly identifier: string
}

export interface InteractionDescriptorOptions extends InteractionIdentifier{
    readonly actions: string[]
}

export interface InteractionDescriptorOption extends InteractionIdentifier{
    readonly action: string
    readonly data: Map<string, string>
}

export default abstract class InteractionDescriptor implements InteractionDescriptorOptions{

    readonly identifier: string;
    readonly actions: string[];
    readonly data: Map<string, string>

    protected constructor(opts: InteractionDescriptorOptions){
        this.identifier = opts.identifier
        this.actions = opts.actions
    }

    public static decode(s: string): InteractionDescriptorOption | undefined{
        const keys = s.split(':')
        if(keys.length < 2){
            return undefined
        }

        let [identifier, action] = keys

        const data = new Map<string, string>()
        const items = action.split('?')
        if(items.length > 1){
            const kvList = items[1].split('&')
            for(let item of kvList){
                const kv = item.split('=')
                if(kv.length == 2){
                    data.set(kv[0], kv[1])
                }
            }

            action = items[0]
        }

        return {identifier, action, data}
    }

}
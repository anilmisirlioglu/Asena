interface InteractionIdentifier{
    readonly identifier: string
}

export interface InteractionDescriptorOptions extends InteractionIdentifier{
    readonly actions: string[]
}

export interface InteractionDescriptorOption extends InteractionIdentifier{
    readonly action: string
}

export default abstract class InteractionDescriptor implements InteractionDescriptorOptions{

    readonly identifier: string;
    readonly actions: string[];

    protected constructor(opts: InteractionDescriptorOptions){
        this.identifier = opts.identifier
        this.actions = opts.actions
    }

    public static decode(s: string): InteractionDescriptorOption | undefined{
        const keys = s.split(':')
        if(keys.length < 2){
            return undefined
        }

        return {
            identifier: keys[0],
            action: keys[1]
        }
    }

}
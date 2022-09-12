import { Interaction as DiscordInteraction } from 'discord.js';
import InteractionDescriptor, { InteractionDescriptorOptions } from './InteractionDescriptor';
import SuperClient from '../SuperClient';
import Server from '../structures/Server';

export type GenericInteraction = Interaction<DiscordInteraction>

export interface Action{
    readonly key: string
    readonly data: Map<string, string>
}

// syntax -> category:action?ref=data&ref=data
// category = identifier
export default abstract class Interaction<T extends DiscordInteraction> extends InteractionDescriptor implements InteractionDescriptorOptions{

    protected constructor(opts: InteractionDescriptorOptions){
        super(opts)
    }

    public abstract execute(server: Server, interaction: T, action: Action): void

    protected get client(): SuperClient{
        return SuperClient.getInstance()
    }

}
import { Interaction as DiscordInteraction } from 'discord.js';
import InteractionDescriptor, { InteractionDescriptorOptions } from './InteractionDescriptor';
import SuperClient from '../SuperClient';
import Server from '../structures/Server';

export type GenericInteraction = Interaction<DiscordInteraction>

interface InteractionOptions extends InteractionDescriptorOptions{}

// category:action
// category = identifier
export default abstract class Interaction<T extends DiscordInteraction> extends InteractionDescriptor implements InteractionOptions{

    protected constructor(opts: InteractionOptions){
        super(opts)
    }

    public abstract execute(server: Server, interaction: T, action: string): void

    protected get client(): SuperClient{
        return SuperClient.getInstance()
    }

}
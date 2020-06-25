import Factory from '../Factory';
import { GuildHandler } from './GuildHandler';

export interface IHandler{
    readonly guild: GuildHandler
}

export default abstract class Handler extends Factory{}
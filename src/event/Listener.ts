import Event from './Event';
import { EventType } from '../handlers/EventHandler';

export interface Listener<T extends Event>{

    type: EventType
    onCall(event: T): void

}
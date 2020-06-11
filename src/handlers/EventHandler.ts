import { Listener } from '../event/Listener';
import Event from '../event/Event';

export type EventType = 'RAFFLE_FINISH'
export type EventListener = Listener<Event>

export default class EventHandler{

    private static listeners: {
        [key: string]: EventListener[]
    } = {}

    public static register(listener: EventListener): void{
        const listeners: EventListener[] | undefined = this.listeners[listener.type]
        if(listeners && listeners.length !== 0){
            this.listeners[listener.type].push(listener)
        }else{
            this.listeners[listener.type] = [listener]
        }
    }

    public static registerAll(listeners: EventListener[]): void{
        for(const listener of listeners){
            this.register(listener)
        }
    }

    public static getListeners(type: EventType): EventListener[]{
        return this.listeners[type] ?? []
    }

}
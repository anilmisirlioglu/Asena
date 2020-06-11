import EventHandler, { EventType, EventListener } from '../handlers/EventHandler';

export default abstract class Event{

    protected constructor(private readonly type: EventType){}

    public call(): void{
        const listeners: EventListener[] = EventHandler.getListeners(this.type)
        for(const listener of listeners){
            listener.onCall(this)
        }
    }

}
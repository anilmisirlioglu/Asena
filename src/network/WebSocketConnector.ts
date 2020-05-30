import { WebSocketLink } from 'apollo-link-ws'
import ws from 'ws'

export class WebSocketConnector{

    private readonly connection: WebSocketLink

    public constructor(){
        this.connection = new WebSocketLink({
            uri: 'ws//localhost:4141/graphql',
            options: {
                reconnect: true
            },
            webSocketImpl: ws
        })
    }

    public getClient(): WebSocketLink{
        return this.connection
    }
}
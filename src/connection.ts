import express, { Application } from 'express'
import { ApolloServer } from 'apollo-server-express'
import { importSchema } from 'graphql-import'
import jwt from 'jsonwebtoken'

import MongoDB from './drivers/MongoDB'

import resolvers from './graphql/resolvers'

import { RaffleHandler } from './handlers/RaffleHandler'

import * as http from 'http';

const typeDefs = importSchema('src/graphql/schema.graphql')

// Models
const Raffle = require('./models/Raffle')

// PubSub
const pubsub = require('./utils/PubSub')

const connection = async() => {
    const app: Application = express()

    const server: ApolloServer = new ApolloServer({
        resolvers,
        typeDefs,
        context: ({ req }) => ({
            Raffle,
            pubsub
        }),
        introspection: true,
        playground: true
    })

    const mongodb = new MongoDB();
    await mongodb.connect();

    app.use((req, res, next) => {
        const token = req.header['authorization'];

        if(token && token !== "null"){
            try{
                req.headers.activeUser = jwt.verify(token, process.env.JWT_SECRET_KEY) as string
            }catch(error){
                console.error(error);
            }
        }

        next()
    });

    server.applyMiddleware({
        app,
        path: '/api',
        cors: {
            origin: true,
            credentials: true
        }
    });

    const httpServer: http.Server = http.createServer(app);

    const PORT: number = parseInt(process.env.PORT, 10) || 4141;
    server.installSubscriptionHandlers(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
    });
}

export default connection
export { connection }
const http = require('http');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { importSchema } = require('graphql-import');
const jwt = require('jsonwebtoken');

const { RaffleHandler } = require('./handlers/RaffleHandler');

const databaseConnection = require('./drivers/mongodb');

const dotenv = require('dotenv');

const resolvers = require('./graphql/resolvers/index');

const typeDefs = importSchema('src/graphql/schema.graphql');

// Models
const Raffle = require('./models/Raffle')

// PubSub
const pubsub = require('./utils/pubsub')

module.exports = async () => {
    const app = express();

    const server = new ApolloServer({
        resolvers,
        typeDefs,
        context: ({ req }) => ({
            Raffle,
            pubsub
        }),
        introspection: true,
        playground: true
    });

    dotenv.config({
        path: `${__dirname}/../.env`
    });

    databaseConnection();

    app.use((req, res, next) => {
        const token = req.header['authorization'];

        if(token && token !== "null"){
            try{
                req.headers.activeUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
            }catch(error){
                console.error(error);
            }
        }

        next();
    });

    server.applyMiddleware({
        app,
        path: '/api',
        cors: {
            origin: true,
            credentials: true
        }
    });

    const httpServer = http.createServer(app);

    const PORT = parseInt(process.env.PORT, 10) || 4141;
    server.installSubscriptionHandlers(httpServer)

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
    });

    // start raffle handler & check
    (new RaffleHandler(Raffle, pubsub)).startJobSchedule()
};
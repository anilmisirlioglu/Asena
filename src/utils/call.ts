import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools'
import { importSchema } from 'graphql-import'
import resolvers from '../graphql/resolvers'

// Context
import Raffle from '../models/Raffle'

// PubSub
import pubsub from './PubSub'

interface CallParams{
    readonly source: string,
    readonly variableValues: {
        [key: string]: any
    }
}

let schema;

const callable = async(params: CallParams) => {
    const typeDefs = importSchema('src/graphql/schema.graphql');

    if(!schema){
        schema = makeExecutableSchema({
            typeDefs: `scalar Upload ${typeDefs}`,
            resolvers
        });
    }

    return await graphql({
        source: params.source,
        variableValues: params.variableValues,
        schema,
        contextValue: {
            Raffle,
            pubsub
        }
    });
}

export default callable
export { callable }
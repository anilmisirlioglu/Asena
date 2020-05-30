const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { importSchema } = require('graphql-import');
const resolvers = require('./../graphql/resolvers');

// Context

let schema;
module.exports = async({ source, variableValues }) => {
    const typeDefs = importSchema('src/graphql/schema.graphql');

    if(!schema){
        schema = makeExecutableSchema({
            typeDefs: `scalar Upload ${typeDefs}`,
            resolvers
        });
    }

    return await graphql({
        source,
        variableValues,
        schema,
        contextValue: {
        }
    });
}
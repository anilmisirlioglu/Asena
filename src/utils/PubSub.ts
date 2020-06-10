const { PubSub } = require('apollo-server-express');
const pubsub = new PubSub();

export default pubsub
export { pubsub }
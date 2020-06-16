import MongoDB from './drivers/MongoDB'

const connection = () => {
    const mongodb = new MongoDB();
    mongodb.connect().then(() => {});
}

export default connection
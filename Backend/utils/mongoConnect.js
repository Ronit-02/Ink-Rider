const mongoose = require('mongoose')
const config = require('../config/config.js')

const username = encodeURIComponent(config.MONGO_USERNAME)
const password = encodeURIComponent(config.MONGO_PASSWORD)
const db_name = config.DB_NAME
const mongo_uri = `mongodb+srv://${username}:${password}@cluster0.z9vf1hq.mongodb.net/${db_name}?appName=Cluster0`
// Alternative URI without using the SRV connection
const mongo_uri_without_srv = `mongodb://${username}:${password}@ac-yeoah2k-shard-00-00.z9vf1hq.mongodb.net:27017,ac-yeoah2k-shard-00-01.z9vf1hq.mongodb.net:27017,ac-yeoah2k-shard-00-02.z9vf1hq.mongodb.net:27017/${db_name}?ssl=true&replicaSet=atlas-o6h30g-shard-0&authSource=admin&appName=Cluster0`

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongo_uri_without_srv);
        console.log("Successfully connected to MongoDB")
    } catch (err) {
        console.log('Error connecting to mongodb - ', err);
        process.exit(1); // Exit the process with an error code
    }
}

const checkMongoConnection = () => {
    const state = mongoose.connection.readyState;
    return state === 1
}

module.exports = {
    connectToMongoDB, 
    checkMongoConnection
};
const mongoose = require('mongoose')
const config = require('../config/config.js')

const username = encodeURIComponent(config.MONGO_USERNAME)
const password = encodeURIComponent(config.MONGO_PASSWORD)
const db_name = config.DB_NAME
const mongo_uri = `mongodb+srv://${username}:${password}@cluster0.z9vf1hq.mongodb.net/${db_name}?appName=Cluster0`

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongo_uri);
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
const mongoose = require('mongoose')
const config = require('../config/config.js')
const { createMongoQueryDiagnostics } = require('../services/observability.service.js')

const username = encodeURIComponent(config.MONGO_USERNAME || '')
const password = encodeURIComponent(config.MONGO_PASSWORD || '')
const mongoUri = config.MONGO_URI || `mongodb+srv://${username}:${password}@cluster0.67xcpyv.mongodb.net/${config.DB_NAME}?appName=Cluster0`

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongoUri, { monitorCommands: true });
        createMongoQueryDiagnostics({ client: mongoose.connection.getClient() });
        console.log("Successfully connected to MongoDB")
    } catch (err) {
        console.error('Unable to connect to MongoDB');
        console.log(err);
        throw err;
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

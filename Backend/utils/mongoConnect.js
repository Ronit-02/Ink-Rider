const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const username = encodeURIComponent(process.env.MONGO_USERNAME)
const password = encodeURIComponent(process.env.MONGO_PASSWORD)
const db_name = process.env.DB_NAME
const mongo_uri = `mongodb+srv://${username}:${password}@cluster0.z9vf1hq.mongodb.net/${db_name}?appName=Cluster0`

mongoose.connect(mongo_uri)
.then(() => {
})
.catch((err) => {
    console.log('Error connecting mongodb', err)
})

const checkMongoConnection = () => {
    const state = mongoose.connection.readyState;
    return state === 1
}

module.exports = {checkMongoConnection};
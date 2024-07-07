const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()

const mongo_uri = `mongodb+srv://ronitkhatri:${process.env.MONGO_PASSWORD}@cluster0.z9vf1hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

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
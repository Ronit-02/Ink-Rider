const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const config = require('../config/config.js')
const routes = require("../routes/index.js");
const { connectToMongoDB, checkMongoConnection } = require('../utils/mongoConnect.js')

const app = express();
const PORT = config.PORT;


// Middlewares
app.use(cors({            // defining cors
  origin: config.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))
app.use(express.json());  // for express framework
app.use(morgan('dev'));   // for automatic logging
app.use(express.urlencoded({ extended: true }));  // for parsing form-data


// Routes
app.use('/api', routes);
app.use((req, res) => {
    res.status(404).json({ error: 'Route Not Found' });
})


// Connecting Database and checking connection status
connectToMongoDB();
app.get('/status', async (req, res) => {
    const isDatabaseRunning = await checkMongoConnection()
    if(isDatabaseRunning)
        res.status(200).send({status: 'ok'});
    else    
        res.status(503).send({status: 'error', message: 'Mongodb connection failed'});
})

module.exports = app;
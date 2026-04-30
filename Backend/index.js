const express = require('express');
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;


// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}))

app.use(express.json());

// Routes
const routes = require('./routes');
app.use('/api', routes);


// Connecting Database
try {
  require('./utils/mongoConnect')
}
catch (err) {
  console.log('Error connecting with database..')
}

// Check status if backend and database is working
app.get('/status', async (req, res) => {
    const isDatabaseRunning = await checkMongoConnection()
    if(isDatabaseRunning)
        res.status(200).send({status: 'ok'});
    else    
        res.status(503).send({status: 'error', message: 'Mongodb connection failed'});
})

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
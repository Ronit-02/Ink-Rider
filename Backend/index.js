const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const session = require('express-session');
const passport = require('passport')


// Connecting Database
// try {
    require('./database/mongoConnect')
// }
// catch (err) {
//     console.log('Error connecting with database..')
// }


// Building app
dotenv.config()
const port = process.env.PORT || 8000;
const app = express();


// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize())
app.use(passport.session())
app.use(cors({
    origin: [`${process.env.FRONTEND_URL}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}))


// Routing
const routes = require('./routes');
const { checkMongoConnection } = require('./database/mongoConnect');
app.use('/api', routes);


app.get('/', (req, res) => {
    res.send('Welcome to the app')
})

// Check status if backend and database is working
app.get('/status', async (req, res) => {
    const isDatabaseRunning = await checkMongoConnection()
    if(isDatabaseRunning)
        res.status(200).send({status: 'ok'});
    else    
        res.status(503).send({status: 'error', message: 'Mongodb connection failed'});
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
const express = require('express');
const router  = express.Router();

const authRoute        = require('./auth.routes');
const postRoute        = require('./post.routes');
const userRoute        = require('./user.routes');
const collectionRoute  = require('./collection.routes');
const questionRoute    = require('./question.routes');
const competitionRoute = require('./competition.routes');

router.get('/', (req, res) => res.send('API is running 🚀'));

router.use('/auth',        authRoute);
router.use('/post',        postRoute);
router.use('/user',        userRoute);
router.use('/collection',  collectionRoute);
router.use('/question',    questionRoute);
router.use('/competition', competitionRoute);

module.exports = router;
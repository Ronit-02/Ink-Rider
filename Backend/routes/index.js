const express = require('express');
const router = express.Router();
const authRoute = require('./authRoute');
const postRoute = require('./postRoute');
const userRoute = require('./userRoute');

router.get('/', (req, res) => {
    res.send('API is running 🚀');
});
router.use('/auth', authRoute);
router.use('/post', postRoute);
router.use('/user', userRoute);

module.exports = router;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js')

const verifyPassword = async (pass1, pass2) => {
    const response = await bcrypt.compare(pass1, pass2);
    return response;
}

const hashPassword = async (pass, salt=10) => {
    const hashedPass = await bcrypt.hash(pass, salt);
    return hashedPass;
}

const generateToken = (payload) => {
    const token = jwt.sign(payload, config.JWT_SECRET, {expiresIn: '1h'});
    return token;
}

const verifyToken = (token) => {
    const data = jwt.verify(token, config.JWT_SECRET);
    return data;
}

// both included
const generateRandom = (start, end) => {
    const no = Math.floor(Math.random() * end) + start;
    return no;
}

module.exports = {
    verifyPassword,
    hashPassword,
    generateToken,
    verifyToken,
    generateRandom
}
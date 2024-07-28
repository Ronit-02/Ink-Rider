const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')


const hashPassword = async (pass, salt=10) => {
    const hashedPass = await bcrypt.hash(pass, salt);
    return hashedPass;
}


const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});
    return token;
}


const verifyToken = (token) => {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return data;
}


const verifyPassword = async (pass1, pass2) => {
    const response = await bcrypt.compare(pass1, pass2);
    return response;
}


// both included
const generateRandom = (start, end) => {
    const no = Math.floor(Math.random() * end) + start;
    return no;
}

const capitalizeString = (str) => {
    return str.toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


module.exports = {hashPassword, generateToken, verifyToken, verifyPassword, generateRandom, capitalizeString};
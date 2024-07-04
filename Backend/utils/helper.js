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
    console.log("pass1 = ", pass1);
    console.log("pass2 = ", pass2);
    const response = await bcrypt.compare(pass1, pass2);
    console.log("response - ", response);
    return response;
}

module.exports = {hashPassword, generateToken, verifyToken, verifyPassword};
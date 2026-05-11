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

const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

const getOTPHTML = (otp) => {
    return `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;"></div>
            <h2 style="color: #333;">Your Ink Rider OTP</h2>
            <p style="font-size: 18px; color: #555;">Use the following One-Time Password (OTP) to verify your email address:</p>
            <h3 style="color: #007bff;">${otp}</h3>
            <p style="font-size: 14px; color: #777;">This will expire in 10 minutes.</p>
        </div>
    `;
}

module.exports = {
    verifyPassword,
    hashPassword,
    generateToken,
    verifyToken,
    generateRandom,
    generateOTP,
    getOTPHTML
}
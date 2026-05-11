const nodemailer = require('nodemailer');
const config = require('../config/config.js');

// Sending Mail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        // pass: process.env.EMAIL_PASSWORD,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    },
    secure: false
})

// Verifying transporter setup
transporter.verify((error, success) => {
    if(error)        
        console.log('Error in setting up transporter:', error);
    else
        console.log('Email transporter is ready');
})

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent: %s', info.response);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    catch(err){
        console.log('Error in sending email:', err);
    }
}

module.exports = {
    sendEmail
}
const nodemailer = require('nodemailer');
const config = require('../config/config.js');

let transporter = null;

const getTransporter = () => {
    if (transporter) return transporter;

    if (!config.EMAIL_HOST || !config.EMAIL_PORT || !config.EMAIL) {
        const error = new Error('Email provider is not configured');
        error.code = 'PROVIDER_NOT_CONFIGURED';
        throw error;
    }

    const hasGoogleOAuth = config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_REFRESH_TOKEN;
    const auth = hasGoogleOAuth ? {
        type: 'OAuth2',
        user: config.EMAIL,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
    } : config.EMAIL_PASSWORD ? { user: config.EMAIL, pass: config.EMAIL_PASSWORD } : null;
    if (!auth) {
        const error = new Error('Email credentials are not configured');
        error.code = 'PROVIDER_NOT_CONFIGURED';
        throw error;
    }

    transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: Number(config.EMAIL_PORT),
        auth,
        secure: config.EMAIL_SECURE || Number(config.EMAIL_PORT) === 465,
    });

    return transporter;
};

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    const info = await getTransporter().sendMail({
        from: config.EMAIL,
        to,
        subject,
        text,
        html
    });

    return { messageId: info.messageId };
}

module.exports = {
    sendEmail
}

const User = require('../schemas/userSchema');
const nodemailer = require('nodemailer')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const {hashPassword, generateToken, verifyToken, verifyPassword, generateRandom} = require('../utils/helper')
const {userPictures} = require('../database/data.js');

const login = async (req, res) => {

    const { email, password } = req.body;
    try{
        const user = await User.findOne({email});

        // check if google logged-in
        if(user && user.googleId)
            return res.status(400).send({message: 'Account is Google logged-in'})

        if(user && await verifyPassword(password, user.password)){
            if(user.verified){
                
                // Issuing a JWT
                const payload = {email: user.email, id: user._id};
                const token = generateToken(payload);
                return res.status(200).send({token, username: user.username, email});
            }
            else{
                return res.status(401).send({message: 'Email not verified'});
            }
        }
        else{
            return res.status(500).send({message: 'Invalid credentials'});
        }
    }
    catch(err){
        return res.status(500).send({message: err.toString()});
    }
}

const signup = async (req, res) => {

    try{
        const { username, email, password } = req.body;
        
        // Assigning a random image from assets
        const random = generateRandom(0, userPictures.length - 1);
        const picture = userPictures[random];
    
        // Hashing password
        const hashedPassowrd = await hashPassword(password);
    
        // Email Validation
        if(await User.findOne({email: email})){
            console.log('Email linked with another account');
            return res.status(500).send({message: 'Email linked with another account'});
        }
        // Username Validation
        if(await User.findOne({username: username})){
            console.log('Username already in use');
            return res.status(500).send({message: 'Username already in use'});
        }
    
        const user = new User({
            picture: picture,
            username: username, 
            email: email, 
            password: hashedPassowrd
        });
        await user.save();
    
        // Issuing JWT
        const payload = {email, id: user._id};
        const token = generateToken(payload);
    
        // Sending Mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
            secure: false
        })
    
        const mailOptions = {
            to: email,
            subject: "Email Verification",
            html: `<b>Verify your Email</b><p>Please verify your email by clicking on this <a href="${process.env.BASE_URL}/api/auth/verify-email?token=${token}">Click here to verify</a></p>`
        }
    
        transporter.sendMail(mailOptions, (err, info) => {
            if(err)
                return res.status(500).send({message: 'Error occured'})
            else
                return res.status(200).send({message: 'Verification Mail sent successfully'});
        })
    }
    catch(err){
        return res.status(500).send({message: 'Cant Signup now, try again later'})
    }
}

const verifyEmail = async (req, res) => {

    try{
        const {token} = req.query;
        const decoded = verifyToken(token);
        const user = await User.findOne({email: decoded.email})
    
        if(user){
            user.verified = true;
            await user.save();
            console.log('Email verified successfully');
            res.redirect(`${process.env.FRONTEND_URL}/login`);
        }
        else{
            res.status(400).send('Invalid Token')
            console.log('Invalid Token');
        }
    }
    catch(err) {
        res.status(400).send('Error occured while verifying');
        console.log('Error occured while verifying');
    }
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            
            // check if email logged-in
            let user = await User.findOne({ email: email });
            if(user && !user.googleId){
                return done(null, false, {message: "Please sign in using email and password"});
            }

            if (!user) {
                const password = process.env.GOOGLE_USER_PASSWORD;
                user = new User({
                    picture: profile.photos[0].value, 
                    username: profile.displayName, 
                    email: email, 
                    password: password,
                    verified: true,
                    googleId: profile.id
                });

                await user.save();
            }   
            return done(null, user);
        } 
        catch (err) {
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if(err){
            return next(err);
        }
        if(!user){
            return res.redirect(`${process.env.FRONTEND_URL}/auth/google/failure?message=${info.message}`);
        }
        req.logIn(user, (err) => {
            if(err)
                return next(err);
            const payload = {email: req.user.email, id: req.user._id};
            const token = generateToken(payload);
            res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}&username=${req.user.username}&email=${req.user.email}`);
        })
    })(req, res, next);
}


const forgotPassowrd = async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
        console.log('Email is not linked to any account');
        return res.status(400).send({message: 'Email is not linked to any account'});
    }

    // Issuing a JWT
    const payload = {email, id: user._id};
    const token = generateToken(payload);

    // Sending Mail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        secure: false
    })

    const mailOptions = {
        to: email,
        subject: "Password Reset",
        html: `<b>Reset Your Password</b><p>You need to reset your password within 1 hour. Please reset your password by clicking on this <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Click here to reset</a></p>`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err)
            return res.status(500).send({message: 'Error occured'})
        else
            return res.status(200).send('Password reset mail has been sent successfully');
    })
}

const resetPassword = async (req, res) => {
    const {password, token} = req.body;
    
    const decoded = verifyToken(token);
    const user = await User.findOne({email: decoded.email});
    
    if(!user){
        console.log('Unauthorized Access');
        return res.status(401).send({message: 'Unauthorized Access'});
    }

    try {
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        await user.save();
        console.log('Password Reset Successful');
        return res.status(200).send({message: 'Password Reset Successful'})
    }
    catch(error){
        console.log('Error occured in resetting, try again later');
        return res.status(500).send({message: 'Error occured in resetting, try again later'});
    }
}   


module.exports = {login, signup, verifyEmail, googleAuth, googleAuthCallback, forgotPassowrd, resetPassword};
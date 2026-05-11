const User = require('../schemas/user.schema');
const { verifyPassword, hashPassword, generateToken, generateRandom, generateOTP, getOTPHTML } = require('../utils/helper');
const { Avatars } = require('../assets/data');
const { sendEmail } = require('../services/email.service.js');
const OTP = require('../schemas/otp.schema');

const login = async (req, res) => {
    
    try{
        // login data is sent in request body
        const { email, password } = req.body;

        const user = await User.findOne({email});
        console.log('User found !');

        // check if google logged-in
        if(user && user.googleId)
            return res.status(400).send({message: 'Account is Google logged-in'})

        // check if email is verified
        if(user && !user.verified)
            return res.status(400).send({message: 'Please verify your email before logging in'});

        // verifying password
        if(user && await verifyPassword(password, user.password)){
                
                // Issuing a JWT
                const payload = { email: user.email, id: user._id };
                const token = generateToken(payload);
                // console.log('Login successful, token generated:', token);
                return res.status(200).send({token, username: user.username, email, role: user.role});
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
        // signup data is sent in request body
        const { username, email, password } = req.body;
        
        // Assigning a random image from assets
        const random = generateRandom(0, Avatars.length - 1);
        const picture = Avatars[random];
    
        // Hashing password
        const hashedPassowrd = await hashPassword(password);
    
        // Email and Username Validation
        if(await User.findOne({email: email})){
            console.log('Email linked with another account');
            return res.status(500).send({message: 'Email linked with another account'});
        } 
        if(await User.findOne({username: username})){
            console.log('Username already in use');
            return res.status(500).send({message: 'Username already in use'});
        }

        // Creating User
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

        // return res.status(200).send({token, username, email});

        // Generating OTP and saving in database
        const otp = generateOTP();
        const otpHash = await hashPassword(otp);
        const otpHtml = getOTPHTML(otp);
        await OTP.create({
            email,
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        })

        // Sending OTP to user's email
        await sendEmail(
            email,
            'Ink Rider - Email Verification',
            `Your OTP for email verification is ${otp}`,
            otpHtml
        )

        return res.status(200).send({message: 'Signup successful, please verify your email'});
    }
    catch(err){
        console.log('Error in signup:', err);
        return res.status(500).send({message: 'Cant Signup now, try again later'})
    }
}

const verifyEmail = async (req, res) =>{
    try{
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({email});
        if(!otpRecord)
            return res.status(400).send({message: 'OTP not found, request for new one'});

        if(otpRecord.expiresAt < new Date())
            return res.status(400).send({message: 'OTP expired, request for new one'});
        
        if(await verifyPassword(otp, otpRecord.otpHash)){

            await User.findOneAndUpdate(
                {email}, 
                {verified: true}
            );
            await OTP.deleteMany({email}); // Deleting all OTPs of the user after successful verification
            return res.status(200).send({message: 'Email verified successfully'});
        }
        else{
            return res.status(400).send({message: 'Invalid OTP'});
        }
    } 
    catch(err){
        console.log('Error in email verification:', err);
        return res.status(500).send({message: 'Cant verify email now, try again later'})
    }        
}

module.exports = {
    login,
    signup,
    verifyEmail
}
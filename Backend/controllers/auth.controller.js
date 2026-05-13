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
            return res.status(400).json({message: 'Account is Google logged-in'});

        // check if email is verified, if not generate OTP and send to email for verification
        if(user && !user.verified){
            
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
            return res.status(400).json({
                success: false,
                code: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email before logging in'
            });
        }

        // verifying password
        if(user && await verifyPassword(password, user.password)){
                
                // Issuing a JWT
                const payload = { email, id: user._id };
                const accessToken = generateToken(payload, '10m');
                const refreshToken = generateToken(payload, '7d');

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                
                console.log('Login successful !!');
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    token: accessToken, 
                    username: user.username, 
                    email, 
                    role: user.role
                });
        }
        else{
            return res.status(500).json({message: 'Invalid credentials'});
        }
    }
    catch(err){
        return res.status(500).json({message: err.toString()});
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
            return res.status(500).json({message: 'Email linked with another account'});
        } 
        if(await User.findOne({username: username})){
            console.log('Username already in use');
            return res.status(500).json({message: 'Username already in use'});
        }

        // Creating User
        const user = new User({
            picture: picture,
            username: username, 
            email: email, 
            password: hashedPassowrd
        });
        await user.save();

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

        return res.status(200).json({message: 'Signup successful, please verify your email'});
    }
    catch(err){
        console.log('Error in signup:', err);
        return res.status(500).json({message: 'Cant Signup now, try again later'})
    }
}

const verifyEmail = async (req, res) =>{
    try{
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({email});
        if(!otpRecord)
            return res.status(400).json({message: 'OTP not found, request for new one'});

        if(otpRecord.expiresAt < new Date())
            return res.status(400).json({message: 'OTP expired, request for new one'});
        
        if(await verifyPassword(otp, otpRecord.otpHash)){

            // Marking user as verified
            await User.findOneAndUpdate(
                {email}, 
                {verified: true}
            );
            
            // Deleting all OTPs of the user after successful verification
            await OTP.deleteMany({email}); 

            // Issuing JWT
            const user = await User.findOne({email});
            const payload = { email, id: user._id };
            const accessToken = generateToken(payload, '10m');
            const refreshToken = generateToken(payload, '7d');

            // Setting refresh token in httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                token: accessToken, 
                username: user.username, 
                email,
                role: user.role, 
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }
    } 
    catch(err){
        console.log('Error in email verification:', err);
        return res.status(500).json({message: 'Cant verify email now, try again later'})
    }        
}

const resendOtp = async (req, res) => {
    try{
        const { email } = req.body;

        // Check if user exists and not verified
        const user = await User.findOne({email});
        if(!user)
            return res.status(404).json({message: 'User not found'});
        if(user.verified)
            return res.status(400).json({message: 'Email already verified'});

        // delete old OTPs
        await OTP.deleteMany({email});

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

        return res.status(200).json({message: 'OTP resent successfully'});
    }
    catch(err){
        console.log('Error in resending OTP:', err);
        return res.status(500).json({message: 'Cant resend OTP now, try again later'})
    }
}

const refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken)
            return res.status(401).json({message: 'Refresh token not found, login again'});

        // verifying refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // finding user
        const user = await User.findById(decoded.id);
        
        // generating new tokens
        const payload = { email: user.email, id: user._id };
        const newAccessToken = generateToken(payload, '10m');
        const newRefreshToken = generateToken(payload, '7d');

        // Setting new refresh token in httpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: newAccessToken,
            user: user.username,
            email: user.email,
            role: user.role
        });
    }
    catch(err){
        console.log('Error in refreshing token:', err);
        return res.status(500).json({message: 'Cant refresh token now, try again later'})
    }
}

module.exports = {
    login,
    signup,
    verifyEmail,
    resendOtp,
    refreshToken
}
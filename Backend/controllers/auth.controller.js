const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyPassword, hashPassword, generateToken, generateRandom, generateOTP, getOTPHTML } = require('../utils/helper');
const { Avatars } = require('../assets/data');
const { sendEmail } = require('../services/email.service.js');
const User = require('../schemas/user.schema');
const Session = require('../schemas/session.schema');
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
                const sessionId = crypto.randomUUID();
                const accessToken = generateToken(
                    { email, id: user._id }, 
                    '10m'
                );
                const refreshToken = generateToken(
                    { email, id: user._id, sessionId }, 
                    '7d'
                );

                // Saving session in database
                const session = new Session({
                    user: user._id,
                    sessionId,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                })
                await session.save();

                // Setting refresh token in cookie
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
            return res.status(500).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    }
    catch(err){
        return res.status(500).json({
            success: false, 
            message: err.toString()
        });
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
            return res.status(500).json({
                success: false,
                message: 'Email linked with another account'
            });
        } 
        if(await User.findOne({username: username})){
            console.log('Username already in use');
            return res.status(500).json({
                success: false,
                message: 'Username already in use'
            });
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

        return res.status(200).json({
            success: true,
            message: 'Signup successful, please verify your email'
        });
    }
    catch(err){
        console.log('Error in signup:', err);
        return res.status(500).json({
            success: false,
            message: 'Cant Signup now, try again later'
        })
    }
}

const verifyEmail = async (req, res) =>{
    try{
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({email});
        if(!otpRecord)
            return res.status(400).json({
                success: false,
                code: "OTP_NOT_FOUND",
                message: 'OTP not found, request for new one'
            });

        if(otpRecord.expiresAt < new Date())
            return res.status(400).json({
                success: false,
                code: "OTP_EXPIRED",
                message: 'OTP expired, request for new one'
            });
        
        if(await verifyPassword(otp, otpRecord.otpHash)){

            // Marking user as verified
            await User.findOneAndUpdate(
                { email }, 
                { verified: true }
            );
            
            // Deleting all OTPs of the user after successful verification
            await OTP.deleteMany({email}); 

            // Issuing JWT
            const user = await User.findOne({email});
            const sessionId = crypto.randomUUID();
            const accessToken = generateToken(
                { email, id: user._id }, 
                '10m'
            );
            const refreshToken = generateToken(
                { email, id: user._id, sessionId },
                '7d'
            );
            
            // Saving session in database
            const session = new Session({
                user: user._id,
                sessionId,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            })
            await session.save();

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
        return res.status(500).json({
            success: false,
            message: 'Cant verify email now, try again later'
        })
    }        
}

const logout = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                message: 'Refresh token not found, login again'
            });
        }

        // Find and Update session to revoke refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        await Session.findOneAndUpdate(
            { sessionId: decoded.sessionId, revoked: false },
            { revoked: true }
        );

        // Clearing refresh token cookie
        res.clearCookie('refreshToken');

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch(err){
        console.log('Error in logout:', err);
        return res.status(500).json({
            success: false,
            message: 'Cant logout now, try again later'
        })
    }
}

const logoutAll = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                message: 'Refresh token not found, login again'
            });
        }

        // verifying refresh token to get user id
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // revoking all refresh tokens of the user
        await Session.updateMany(
            { user: decoded.id, revoked: false },
            { revoked: true }
        );

        // clearing refresh token cookie
        res.clearCookie('refreshToken');

        return res.status(200).json({
            success: true,
            message: 'All sessions logged out successfully'
        });
    }
    catch(err){
        console.log('Error in logout all sessions:', err);
        return res.status(500).json({
            success: false,
            message: 'Cant logout all sessions now, try again later'
        })
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

        return res.status(200).json({
            success: true,
            message: 'OTP resent successfully'
        });
    }
    catch(err){
        console.log('Error in resending OTP:', err);
        return res.status(500).json({
            success: false,
            message: 'Cant resend OTP now, try again later'
        })
    }
}

const refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found, login again'
            });
        }
        
        // verifying refresh token and finding if its revoked or not
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const session = await Session.findOne({
            sessionId: decoded.sessionId,
            revoked: false
        })
        if(!session){
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token, login again'
            });
        }
        
        // finding user
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // generating new access token
        const newAccessToken = generateToken(
            { email: user.email, id: user._id }, 
            '10m'
        );

        // checking if we should rotate refresh token or not
        const currentTime = Math.floor(Date.now() / 1000);
        const timeLeft = decoded.exp - currentTime;
        const shouldRotate = timeLeft < (24 * 60 * 60); // Rotate if less than 1 day left

        // rotating refresh token if needed
        if(shouldRotate){

            // revoking old session id and saving new one in database
            const newSessionId = crypto.randomUUID();
            session.sessionId = newSessionId;
            await session.save();
            
            // generating new tokens
            const newRefreshToken = generateToken(
                { email: user.email, id: user._id, sessionId: newSessionId }, 
                '7d'
            );
            
            // Setting new refresh token in httpOnly cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            user: user.username,
            email: user.email,
            role: user.role
        });
    }
    catch(err){

        // Refresh Token expired
        if(err.name === 'TokenExpiredError'){
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired, login again'
            });
        }

        // Invalid token
        if(err.name === 'JsonWebTokenError'){
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        console.log('Error in refreshing token:', err);        
        return res.status(500).json({
            success: false,
            message: 'Cant refresh token now, try again later'
        })
    }
}

module.exports = {
    login,
    signup,
    verifyEmail,
    logout,
    logoutAll,
    resendOtp,
    refreshToken
}
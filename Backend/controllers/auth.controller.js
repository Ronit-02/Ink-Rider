const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyPassword, hashPassword, generateToken, generateRandom, generateOTP, getOTPHTML } = require('../utils/helper');
const { Avatars } = require('../assets/data');
const { sendEmail } = require('../services/email.service.js');
const User = require('../schemas/user.schema');
const Session = require('../schemas/session.schema');
const OTP = require('../schemas/otp.schema');
const config = require('../config/config');
const { createProfileForUser } = require('../services/profile.service');

const refreshCookieOptions = {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookie = (res) => {
    const { maxAge, ...clearOptions } = refreshCookieOptions;
    res.clearCookie('refreshToken', clearOptions);
};

const createGoogleUsername = async (name, email) => {
    const base = String(name || email.split('@')[0] || 'Ink Rider writer')
        .trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'ink-rider-writer';
    let username = base;
    let suffix = 1;
    while (await User.exists({ username })) {
        username = `${base}-${suffix}`.slice(0, 30);
        suffix += 1;
    }
    return username;
};

const verifyGoogleCredential = async credential => {
    if (!config.GOOGLE_CLIENT_ID) {
        const error = new Error('Google authentication is not configured');
        error.code = 'GOOGLE_NOT_CONFIGURED';
        throw error;
    }
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
        const error = new Error('Invalid Google credential');
        error.code = 'GOOGLE_CREDENTIAL_INVALID';
        throw error;
    }
    const claims = await response.json();
    if (claims.aud !== config.GOOGLE_CLIENT_ID || claims.iss !== 'https://accounts.google.com' || claims.email_verified !== 'true' || !claims.sub || !claims.email) {
        const error = new Error('Invalid Google credential');
        error.code = 'GOOGLE_CREDENTIAL_INVALID';
        throw error;
    }
    return claims;
};

const googleLogin = async (req, res) => {
    try {
        const credential = String(req.body?.credential || '').trim();
        if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });
        const claims = await verifyGoogleCredential(credential);
        const email = claims.email.trim().toLowerCase();
        let user = await User.findOne({ googleId: claims.sub });

        if (!user) {
            const emailUser = await User.findOne({ email });
            if (emailUser) {
                if (emailUser.googleId && emailUser.googleId !== claims.sub) {
                    return res.status(409).json({
                        success: false,
                        code: 'GOOGLE_IDENTITY_CONFLICT',
                        message: 'This email is linked to a different Google account',
                    });
                }
                if (!emailUser.googleId) {
                    return res.status(409).json({
                        success: false,
                        code: 'GOOGLE_ACCOUNT_COLLISION',
                        message: 'An account already exists with this email. Sign in with your password instead.',
                    });
                }
                user = emailUser;
            }
        }

        if (user) {
            user.googleId = claims.sub;
            user.verified = true;
            if (claims.picture && !user.picture) user.picture = claims.picture;
            await user.save();
        } else {
            user = await User.create({ username: await createGoogleUsername(claims.name, email), email, googleId: claims.sub, picture: claims.picture || null, verified: true });
            await createProfileForUser({ userId: user._id, username: user.username, picture: user.picture });
        }

        const sessionId = crypto.randomUUID();
        const accessToken = generateToken({ email, id: user._id }, '10m');
        const refreshToken = generateToken({ email, id: user._id, sessionId }, '7d');
        await Session.create({ user: user._id, sessionId, ip: req.ip, userAgent: req.get('User-Agent') || 'unknown' });
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);
        return res.status(200).json({ success: true, message: 'Google login successful', token: accessToken, username: user.username, avatarUrl: user.picture || null, email, role: user.role });
    } catch (err) {
        console.error(`[${req.requestId}] Google login failed`);
        if (err?.code === 'GOOGLE_NOT_CONFIGURED') return res.status(503).json({ success: false, code: err.code, message: 'Google authentication is not configured' });
        if (err?.code === 'GOOGLE_CREDENTIAL_INVALID') return res.status(401).json({ success: false, code: err.code, message: 'Google authentication failed' });
        return res.status(500).json({ success: false, message: 'Unable to sign in with Google at this time' });
    }
};

const login = async (req, res) => {
    
    try{
        // login data is sent in request body
        const { email, password } = req.body;
        if (!email?.trim() || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({email: normalizedEmail});
        // check if google logged-in
        if(user && user.googleId)
            return res.status(400).json({message: 'Account is Google logged-in'});

        // check if email is verified, if not generate OTP and send to email for verification
        if(user && !user.verified){
            
            // Generating OTP and saving in database
            const otp = generateOTP();
            const otpHash = await hashPassword(otp);
            const otpHtml = getOTPHTML(otp);
            await OTP.deleteMany({ email: normalizedEmail });
            await OTP.create({
                email: normalizedEmail,
                user: user._id,
                otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
            })

            // Sending OTP to user's email
            await sendEmail(
                normalizedEmail,
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
                    { email: normalizedEmail, id: user._id }, 
                    '10m'
                );
                const refreshToken = generateToken(
                    { email: normalizedEmail, id: user._id, sessionId }, 
                    '7d'
                );

                // Saving session in database
                const session = new Session({
                    user: user._id,
                    sessionId,
                    ip: req.ip,
                    userAgent: req.get('User-Agent') || 'unknown'
                })
                await session.save();

                // Setting refresh token in cookie
                res.cookie('refreshToken', refreshToken, refreshCookieOptions);
                
                return res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    token: accessToken, 
                    username: user.username, 
                    avatarUrl: user.picture || null,
                    email: normalizedEmail, 
                    role: user.role
                });
        }
        else{
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    }
    catch(err){
        console.error(`[${req.requestId}] Login failed`);
        if (err?.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: err.code, message: 'Email verification is not configured' });
        return res.status(500).json({
            success: false, 
            message: 'Unable to log in at this time'
        });
    }
}

const signup = async (req, res) => {

    try{
        // signup data is sent in request body
        const { username, email, password } = req.body;
        if (!username?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const normalizedUsername = username.trim();
        const normalizedEmail = email.trim().toLowerCase();
        
        // Assigning a random image from assets
        const random = generateRandom(0, Avatars.length - 1);
        const picture = Avatars[random];
    
        // Hashing password
        const hashedPassowrd = await hashPassword(password);
    
        // Email and Username Validation
        const existingEmailUser = await User.findOne({ email: normalizedEmail }).select('googleId');
        if(existingEmailUser){
            return res.status(409).json({
                success: false,
                message: existingEmailUser.googleId
                    ? 'Email linked with Google account'
                    : 'Email linked with another account'
            });
        } 
        if(await User.findOne({username: normalizedUsername})){
            return res.status(409).json({
                success: false,
                message: 'Username already in use'
            });
        }

        // Creating User
        const user = new User({
            picture: picture,
            username: normalizedUsername, 
            email: normalizedEmail, 
            password: hashedPassowrd
        });
        await user.save();

        try {
            await createProfileForUser({
                userId: user._id,
                username: normalizedUsername,
                picture,
            });
        } catch (profileError) {
            await User.deleteOne({ _id: user._id });
            throw profileError;
        }

        // Generating OTP and saving in database
        const otp = generateOTP();
        const otpHash = await hashPassword(otp);
        const otpHtml = getOTPHTML(otp);
        await OTP.create({
            email: normalizedEmail,
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        })

        // Sending OTP to user's email
        await sendEmail(
            normalizedEmail,
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
        console.error(`[${req.requestId}] Signup failed`);
        if (err?.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: err.code, message: 'Email verification is not configured' });
        if (err?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Email or username already in use'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Cant Signup now, try again later'
        })
    }
}

const verifyEmail = async (req, res) =>{
    try{
        const { email, otp } = req.body;
        if (!email?.trim() || !/^\d{6}$/.test(otp || '')) {
            return res.status(400).json({ success: false, message: 'Email and a 6-digit OTP are required' });
        }
        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await OTP.findOne({email: normalizedEmail});
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
                { email: normalizedEmail }, 
                { verified: true }
            );
            
            // Deleting all OTPs of the user after successful verification
            await OTP.deleteMany({email: normalizedEmail}); 

            // Issuing JWT
            const user = await User.findOne({email: normalizedEmail});
            const sessionId = crypto.randomUUID();
            const accessToken = generateToken(
                { email: normalizedEmail, id: user._id }, 
                '10m'
            );
            const refreshToken = generateToken(
                { email: normalizedEmail, id: user._id, sessionId },
                '7d'
            );
            
            // Saving session in database
            const session = new Session({
                user: user._id,
                sessionId,
                ip: req.ip,
                userAgent: req.get('User-Agent') || 'unknown'
            })
            await session.save();

            // Setting refresh token in httpOnly cookie
            res.cookie('refreshToken', refreshToken, refreshCookieOptions);

            return res.status(200).json({
                success: true,
                message: 'Email verified successfully',
                token: accessToken, 
                username: user.username, 
                avatarUrl: user.picture || null,
                email: normalizedEmail,
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
        console.error(`[${req.requestId}] Email verification failed`);
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
        clearRefreshCookie(res);

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch(err){
        console.error(`[${req.requestId}] Logout failed`);
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
        clearRefreshCookie(res);

        return res.status(200).json({
            success: true,
            message: 'All sessions logged out successfully'
        });
    }
    catch(err){
        console.error(`[${req.requestId}] Logout-all failed`);
        return res.status(500).json({
            success: false,
            message: 'Cant logout all sessions now, try again later'
        })
    }
}

const resendOtp = async (req, res) => {
    try{
        const { email } = req.body;
        if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists and not verified
        const user = await User.findOne({email: normalizedEmail});
        if(!user)
            return res.status(404).json({message: 'User not found'});
        if(user.verified)
            return res.status(400).json({message: 'Email already verified'});

        // delete old OTPs
        await OTP.deleteMany({email: normalizedEmail});

        // Generating OTP and saving in database
        const otp = generateOTP();
        const otpHash = await hashPassword(otp);
        const otpHtml = getOTPHTML(otp);
        await OTP.create({
            email: normalizedEmail,
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
        })

        // Sending OTP to user's email
        await sendEmail(
            normalizedEmail,
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
        console.error(`[${req.requestId}] OTP resend failed`);
        if (err?.code === 'PROVIDER_NOT_CONFIGURED') return res.status(503).json({ code: err.code, message: 'Email verification is not configured' });
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
            res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);
        }

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
            user: user.username,
            avatarUrl: user.picture || null,
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

        console.error(`[${req.requestId}] Token refresh failed`);        
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
    refreshToken,
    googleLogin
}

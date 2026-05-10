const User = require('../schemas/user.schema');
const { verifyPassword, hashPassword, generateToken, generateRandom } = require('../utils/helper');
const { Avatars } = require('../assets/data');

const login = async (req, res) => {
    
    try{
        // login data is sent in request body
        const { email, password } = req.body;

        const user = await User.findOne({email});
        console.log('User found !');

        // check if google logged-in
        if(user && user.googleId)
            return res.status(400).send({message: 'Account is Google logged-in'})

        if(user && await verifyPassword(password, user.password)){
            // if(user.verified){
                
                // Issuing a JWT
                const payload = { email: user.email, id: user._id };
                const token = generateToken(payload);
                // console.log('Login successful, token generated:', token);
                return res.status(200).send({token, username: user.username, email, role: user.role});
            // }
            // else{
            //     return res.status(401).send({message: 'Email not verified'});
            // }
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


        return res.status(200).send({token, username, email});
    
        // Sending Mail
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     host: process.env.EMAIL_HOST,
        //     port: process.env.EMAIL_PORT,
        //     auth: {
        //         user: process.env.EMAIL,
        //         pass: process.env.EMAIL_PASSWORD
        //     },
        //     secure: false
        // })
    
        // const mailOptions = {
        //     to: email,
        //     subject: "Email Verification",
        //     html: `<b>Verify your Email</b><p>Please verify your email by clicking on this <a href="${process.env.BASE_URL}/api/auth/verify-email?token=${token}">Click here to verify</a></p>`
        // }
    
        // transporter.sendMail(mailOptions, (err, info) => {
        //     if(err)
        //         return res.status(500).send({message: 'Error occured'})
        //     else
        //         return res.status(200).send({message: 'Verification Mail sent successfully'});
        // })
    }
    catch(err){
        console.log('Error in signup:', err);
        return res.status(500).send({message: 'Cant Signup now, try again later'})
    }
}

module.exports = {
    login,
    signup
}
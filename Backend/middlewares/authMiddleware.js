const User = require('../schemas/userSchema');
const {verifyToken} = require('../utils/helper');

const validateToken = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        // if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //     return res.status(401).send({ message: 'Token is invalid' });
        // }

        const token = authHeader.split(' ')[1];
        // if(token === "null"){
        //     return res.status(401).send({ message: 'Login first' });
        // }
        
        const decoded = verifyToken(token);
        const user = await User.findOne({email: decoded.email});
        // if(!user)
        //     return res.sendStatus(401).send({message: 'Invalid Token'});

        req.user = user;
        console.log('Validated token!!')
        next();
    }
    catch(err){
        // console.log(err)
        res.status(403).send({message: 'Login first'});
    }
}

module.exports = validateToken;
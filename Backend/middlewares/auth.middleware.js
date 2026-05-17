const User = require('../schemas/user.schema');
const { verifyToken } = require('../utils/helper');

const validateToken = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'No token is provided' 
            });
        }
        
        // Separating "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        const decoded = verifyToken(token);

        req.user = { id: decoded.id };
        console.log('Validated token!!')

        next();
    }
    catch(err){
        console.log('Error encountered validating token - ', err)
        res.status(401).json({
            success: false,
            message: 'Login first'
        });
    }
}

module.exports = validateToken;
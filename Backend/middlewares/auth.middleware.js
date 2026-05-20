const User = require('../schemas/user.schema');
const { verifyToken } = require('../utils/helper');

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
        
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    
    // Separating "Bearer <token>"
    return authHeader.split(' ')[1];
}

const validateToken = async (req, res, next) => {
    try{
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Login first'
            });
        }
        
        const decoded = verifyToken(token);

        req.user = { 
            id: decoded.id 
        };

        next();
    }
    catch(err){
        console.log('Error encountered validating token - ', err)
        return res.status(401).json({
            success: false,
            message: 'Invalid or Expired token'
        });
    }
}

const optionalAuth = async (req, res, next) => {
    try{
        const token = extractToken(req);
        if(!token){
            req.user = null;
            return next();
        }
        
        const decoded = verifyToken(token);
        
        req.user = { 
            id: decoded.id 
        }
        
        next();
    }
    catch(err){
        console.log('Optional auth error - ', err)

        if(err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError'){
            return res.status(401).json({
                success: false,
                message: 'Invalid or Expired token'
            });
        }
        else{
            req.user = null;
            next();
        }
    }
}


module.exports = {
    extractToken,
    validateToken,
    optionalAuth,
};
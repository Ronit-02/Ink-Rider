const { verifyToken } = require('../utils/helper');
const User = require('../schemas/user.schema');

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
                message: 'Authentication required'
            });
        }
        
        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select('_id role accountStatus verified').lean();
        if (!user || user.accountStatus === 'suspended' || !user.verified) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        req.auth = Object.freeze({ userId: String(user._id), role: user.role });

        next();
    }
    catch(err){
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
}

const optionalAuth = async (req, res, next) => {
    try{
        const token = extractToken(req);
        if(!token){
            req.auth = null;
            return next();
        }
        
        const decoded = verifyToken(token);
        
        const user = await User.findById(decoded.id).select('_id role accountStatus verified').lean();
        if (!user || user.accountStatus === 'suspended' || !user.verified) {
            req.auth = null;
            return next();
        }

        req.auth = Object.freeze({ userId: String(user._id), role: user.role });
        
        next();
    }
    catch(err){
        if(err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError'){
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        else{
            req.auth = null;
            next();
        }
    }
}

const requireRoles = (...roles) => async (req, res, next) => {
    try {
        const user = await User.findById(req.auth.userId).select('role accountStatus');
        if (!user || user.accountStatus === 'suspended' || !roles.includes(user.role)) return res.status(403).json({ message: 'Staff access required' });
        req.auth = Object.freeze({ ...req.auth, role: user.role });
        return next();
    } catch {
        return res.status(500).json({ message: 'Unable to verify staff access' });
    }
};


module.exports = {
    extractToken,
    validateToken,
    optionalAuth,
    requireRoles,
};

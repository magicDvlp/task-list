const config = require('config');
const jwt = require('jsonwebtoken');
const JWT_SECRET = config.get('JWT_SECRET');
const User = require('../models/user');

const checkToken = async (req, res, next) => {
    const token = req.token;
    if(!token){
        return res.status(401).json({success: false, error: 'You must provide jwt token!'});
    }
    try{
        const {userId, type} = jwt.verify(token, JWT_SECRET);
        if(type != 'accessToken'){
            throw new Error('This is refresh token. You must provide access token!');
        }
        req.user = await User.findById(userId);
        next();
    }catch(error){
        res.status(401).json({success: false, error: error.message})
    }
    
}

module.exports = checkToken;
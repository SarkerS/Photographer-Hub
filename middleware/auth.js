const jwt = require('jsonwebtoken');
const config = require('config');



module.exports = function(req, res, next) { //middleware function; next here is callback that moves to next middleware when finish

    // Get token from hader
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token){
        return res.status(401).json({msg: 'No token found'});
    }

    // Verify token
    try {
        const decode = jwt.verify(token, config.get ('JwtToken'));
        req.user = decode.user;
        next();

    } catch (error) {
        res.status(401).json({msg: 'Invalid Token!!!'});
    }
}
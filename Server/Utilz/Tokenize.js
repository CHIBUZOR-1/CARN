const jwt = require('jsonwebtoken');

const setCookiesWithToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWTSECRET, {expiresIn: "1d"});

    res.cookie('jwt', token, {
        maxAge: 1*24*60*60*1000,
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
    });
};


const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({
                error: true,
                message: "Unauthorized Access"
            })
        }
        const decode = jwt.verify(token, process.env.JWTSECRET);
        if(!decode) {
            return res.status(401).json({
                error: true,
                message: "Invalid Token"
            })
        }
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "An error occured!"
        })
    }
    

}

module.exports = { setCookiesWithToken, verifyToken}
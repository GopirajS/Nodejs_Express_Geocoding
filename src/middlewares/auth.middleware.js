const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Check for token in cookies first, then fallback to Authorization header
    let token = req.cookies.token;
    
    // If no cookie token, check Authorization header (Bearer token)
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};

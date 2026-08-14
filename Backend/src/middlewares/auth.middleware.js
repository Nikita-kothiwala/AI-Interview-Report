import jwt from "jsonwebtoken";

export function authUser(req, res, next) {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const accessToken =
        authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            {
                issuer: "ai-interview-api",
                audience: "ai-interview-client"
            }
        );

        req.user = {
            id: decoded.sub,
            username: decoded.username
        };

        next();

    } catch (error) {

        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Access token expired"
            });
        }

        return res.status(401).json({
            message: "Invalid access token"
        });
    }
}
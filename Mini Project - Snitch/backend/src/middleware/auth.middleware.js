import { readAccessToken } from "../utils/auth.utils.js";

export function authenticate(req , res , next){
    try {
        const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
        
        if (!accessToken) {
            return res.status(401).json({
                message: "Unauthorized ❌",
                error: [
                    {
                        field: "accessToken",
                        message: "Access token not found",
                    },
                ],
            });
        }

        const decodeToken = readAccessToken(accessToken);

        if (!decodeToken) {
            return res.status(401).json({ message: "Invalid or Expired Access Token ❌" });
        }

        const { id: userId, role } = decodeToken;
        
        req.user = { userId, role };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or Expired Access Token ❌" });
    }
}
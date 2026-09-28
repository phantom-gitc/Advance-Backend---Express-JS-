import { readAccessToken } from "../utils/auth.utils.js";

export function authenticate(req, res, next) {
  try {

    const authHeader = req.headers.authorization || req.headers.token;

    const tokenFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const accessToken = req.cookies?.accessToken || tokenFromHeader;

    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized ❌",
        error: [
          {
            field: "accessToken",
            message: "Access token not found in cookies or Authorization header",
          },
        ],
      });
    }
    
    const decodeToken = readAccessToken(accessToken);

    if (!decodeToken) {
      return res
        .status(401)
        .json({ message: "Invalid or Expired Access Token ❌" });
    }


    const { id: userId, role } = decodeToken;

    req.user = { userId, role };


    next();
    
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or Expired Access Token ❌" });
  }
}

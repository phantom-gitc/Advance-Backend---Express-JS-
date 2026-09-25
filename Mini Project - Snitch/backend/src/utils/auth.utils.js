import Config from "../config/config.js";
import jwt from "jsonwebtoken";


// access token creation logic


function createAccessToken({ userId, role }) {

    const accessToken = jwt.sign({
        id: userId,
        role: role
    }, Config.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })

    return accessToken;
}


// refresh token creation logic


function createRefreshToken(userId) {
    const refreshToken = jwt.sign({
        id: userId,
    }, Config.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return refreshToken;
}

export {
    createAccessToken,
    createRefreshToken
}
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


function createRefreshToken(data) {
    const userId = typeof data === "object" && data !== null ? (data.userId || data.id) : data;
    const refreshToken = jwt.sign({
        id: userId,
    }, Config.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return refreshToken;
}



// Read Refresh Token   


function readRefreshToken(refreshToken){
    try {
        
        return jwt.verify(refreshToken , Config.REFRESH_TOKEN_SECRET)
        
    } catch (error) {
        console.log(error)
        return null
    }
}    

export {
    createAccessToken,
    createRefreshToken,
    readRefreshToken
}





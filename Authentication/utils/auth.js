import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";



// Generate access token

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, config.ACCESS_SECRET, {
        expiresIn: config.ACCESS_TOKEN_EXPIRY,
    });
};



// Generate refresh token

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            salt: bcrypt.genSaltSync(10),
        },
        config.REFRESH_SECRET,
        {
            expiresIn: config.REFRESH_TOKEN_EXPIRY,
        }
    );
};


// Generate both access and refresh tokens together 

export const generateTokens = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    return { accessToken, refreshToken };
};


// Cookie options for refresh token

export const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, cookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
    });
};
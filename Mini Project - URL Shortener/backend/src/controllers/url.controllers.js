import express from "express";
import urlModel from "../models/url.model.js";
import generateCode from "../utils/generateCode.js";



// create a new short link
export const handleGenerateNewShortUrl = async (req, res) => {
    try {
        let { url } = req.body;

        if (!url || typeof url !== "string") {
            return res.status(400).json({ error: "URL is required" });
        }

        url = url.trim();

        // auto-prefix if missing protocol
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = `https://${url}`;
        }

        if (url.length > 2048) {
            return res.status(400).json({ error: "URL is too long (max 2048 chars)" });
        }

        // basic url structure validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ error: "Invalid URL format" });
        }

        // if the same url was shortened before, return the existing one
        const existing = await urlModel.findOne({ orignalUrl: url });
        if (existing) {
            return res.status(200).json({
                message: "URL was already shortened",
                data: {
                    orignalUrl: existing.orignalUrl,
                    shortUrl: existing.shortUrl,
                    alreadyExisted: true,
                }
            });
        }

        const shortUrl = generateCode();

        const newUrl = await urlModel.create({ orignalUrl: url, shortUrl });

        return res.status(201).json({
            message: "Short URL created successfully",
            data: {
                orignalUrl: newUrl.orignalUrl,
                shortUrl: newUrl.shortUrl,
                alreadyExisted: false,
            }
        });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// Handle get Urls 


export const handleGetAllUrls = async (req, res) => {

    try {
        const urls = await urlModel.find();

        return res.status(200).json({
            message: "Urls are fetched successfully",
            data: urls
        })

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" })
    }
}


// Handle Redirection 

export const handleRedirectUrl = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const urlEntry = await urlModel.findOneAndUpdate(
            { shortUrl },
            {
                $inc: { clickedCount: 1 }
            },
            { new: true }
        );

        if (!urlEntry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        let redirectUrl = urlEntry.orignalUrl;
        if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
            redirectUrl = `https://${redirectUrl}`;
        }

        return res.redirect(redirectUrl);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// Handle Get Click Count / Analytics

export const handleGetClickCount = async (req, res) => {
    try {
        const { shortUrl } = req.params;

        const urlEntry = await urlModel.findOne({ shortUrl });

        if (!urlEntry) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        return res.status(200).json({
            message: "Click count fetched successfully",
            shortUrl: urlEntry.shortUrl,
            clickedCount: urlEntry.clickedCount,
            orignalUrl: urlEntry.orignalUrl
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// delete a short link by its short code
export const handleDeleteUrl = async (req, res) => {
    try {
        const { shortUrl } = req.params;
        const deleted = await urlModel.findOneAndDelete({ shortUrl });

        if (!deleted) {
            return res.status(404).json({ error: "Short URL not found" });
        }

        return res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

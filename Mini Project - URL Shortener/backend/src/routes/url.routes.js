import express from "express";
import { handleGenerateNewShortUrl, handleGetAllUrls, handleRedirectUrl, handleGetClickCount, handleDeleteUrl } from "../controllers/url.controllers.js";

const router = express.Router()

router.post('/', handleGenerateNewShortUrl)

router.get('/getUrls', handleGetAllUrls)

router.get('/analytics/:shortUrl', handleGetClickCount)

// delete a link by short code
router.delete('/:shortUrl', handleDeleteUrl)

// redirect must come last to avoid catching other routes
router.get('/:shortUrl', handleRedirectUrl)

export default router

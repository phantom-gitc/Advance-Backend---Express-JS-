import { Router } from 'express'
import { getHealth, postChat } from '../controllers/chatController.js'

const router = Router()

router.get('/health', getHealth)
router.post('/chat', postChat)

export default router

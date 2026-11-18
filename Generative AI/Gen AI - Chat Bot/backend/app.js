import express from 'express'
import cors from './config/cors.js'
import apiRoutes from './routes/api.js'

const app = express()

app.use(cors)
app.use(express.json({ limit: '32kb' }))
app.use('/api', apiRoutes)

export default app

import { config } from './env.js'

export default function cors(req, res, next) {
  const origin = req.headers.origin

  if (origin && config.frontendOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
}

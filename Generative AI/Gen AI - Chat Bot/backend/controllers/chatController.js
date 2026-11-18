import chatModel from '../config/groq.js'
import { config } from '../config/env.js'

export function getHealth(_req, res) {
  res.json({ ok: true })
}

export async function postChat(req, res) {
  const { messages } = req.body ?? {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Add a message to start the conversation.' })
  }

  const history = messages.slice(-20).map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      return null
    }
    return { role: message.role, content: message.content.slice(0, 4000) }
  })

  if (history.some((message) => message === null) || history.at(-1)?.role !== 'user') {
    return res.status(400).json({ error: 'Please send a valid user message.' })
  }

  if (!config.groqApiKey) {
    return res.status(503).json({ error: 'Add your GROQ_API_KEY to backend/.env to start chatting.' })
  }

  try {
    const response = await chatModel.invoke([
      { role: 'system', content: 'You are a friendly, thoughtful assistant. Be clear, useful, and concise. Format answers with Markdown when it improves readability: use short headings and lists for structure, and fenced code blocks with a language label for code. Do not add formatting that the answer does not need.' },
      ...history,
    ])
    const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
    return res.json({ reply })
  } catch (error) {
    console.error('Chat request failed:', error.message)
    return res.status(502).json({ error: 'The assistant had a little hiccup. Please try again.' })
  }
}

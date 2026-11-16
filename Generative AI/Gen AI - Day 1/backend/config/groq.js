import { ChatGroq } from '@langchain/groq'
import { config } from './env.js'

const chatModel = new ChatGroq({
  model: config.groqModel,
  apiKey: config.groqApiKey,
  temperature: 0.7,
})

export default chatModel

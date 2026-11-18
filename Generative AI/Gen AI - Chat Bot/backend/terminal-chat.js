import { ChatGroq } from '@langchain/groq'
import dotenv from 'dotenv'
import readline from 'readline/promises'

dotenv.config()

const prompt = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ai = new ChatGroq({
  model: 'openai/gpt-oss-120b',
  apiKey: process.env.GROQ_API_KEY,
})

const messageArray = []

while (true) {
  const userInput = await prompt.question('Enter your input: ')

  // Add the user's message to the conversation history.
  messageArray.push({
    role: 'user',
    content: userInput,
  })

  const stream = await ai.stream(messageArray)
  let aiMessage = ''

  for await (const chunk of stream) {
    aiMessage += chunk.content
    process.stdout.write(chunk.content)
  }

  messageArray.push({
    role: 'assistant',
    content: aiMessage,
  })

  process.stdout.write('\n')
}

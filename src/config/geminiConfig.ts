import { GoogleGenAI } from '@google/genai'

const api_key = process.env.API_KEY_AI as string

const GenAi = new GoogleGenAI({
    apiKey: api_key,
})

export default GenAi;
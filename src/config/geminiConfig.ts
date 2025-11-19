import dotenv from "dotenv";

dotenv.config(); // MUST be first
// import { GoogleGenAI } from '@google/genai'
import { GoogleGenerativeAI } from "@google/generative-ai";


const api_key = process.env.API_KEY_AI as string
console.log("Api Key : " + api_key);

const GenAi = new GoogleGenerativeAI(process.env.API_KEY_AI!);


export default GenAi;
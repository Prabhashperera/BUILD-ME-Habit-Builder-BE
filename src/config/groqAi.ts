import Groq from "groq-sdk";
import dotenv from "dotenv";

// 1. Force load env variables immediately in this file
dotenv.config(); 

const apiKey = process.env.GROQ_API_KEY;

// 2. Add a sanity check to see if the key is actually loaded
if (!apiKey) {
  console.error("❌ CRITICAL ERROR: GROQ_API_KEY is missing from environment variables!");
}

const groq = new Groq({
  apiKey: apiKey, 
  // dangerouslyAllowBrowser: true // Only needed if running on frontend (not your case)
});

export default groq;
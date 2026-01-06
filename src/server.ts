import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';
import userRoute from './routes/authRoute';
import sleepHabitRoute from './routes/habits/sleepHabitRoute';
import cors from "cors";
import serverless from "serverless-http";
import { MongoClient } from 'mongodb';



const server = express();
dotenv.config(); // Load Dotenv files
server.use(express.json())

// https://build-me-habit-builder-fe.vercel.app/
server.use(
    cors({
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

connectDB(process.env.DB_URL) // Connect the Database (Mongodb Cluster)
// let cachedClient: MongoClient | null = null;
// async function connectDB(uri:any) {
//     if (cachedClient) return cachedClient;
//     const client = new MongoClient(uri);
//     await client.connect();
//     cachedClient = client;
//     return client;
// }

server.use('/api/auth', userRoute)
server.use('/api/habit', sleepHabitRoute)




// server.listen(process.env.PORT, () => {
//     console.log("Server Started On : " + process.env.PORT);
// })

export default serverless(server);

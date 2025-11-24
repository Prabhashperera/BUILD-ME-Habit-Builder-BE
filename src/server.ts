import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';
import userRoute from './routes/authRoute';
import sleepHabitRoute from './routes/habits/sleepHabitRoute';
import cors from "cors";


const server = express();
dotenv.config(); // Load Dotenv files
server.use(express.json())

server.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

connectDB(process.env.DB_URL) // Connect the Database (Mongodb Cluster)

server.use('/api/auth', userRoute)
server.use('/api/habit', sleepHabitRoute)




server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
})
import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';
import userRoute from './routes/authRoute';
import sleepHabitRoute from './routes/habits/sleepHabitRoute';
import cors from "cors";



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

// Wrap async startup
const startServer = async () => {
  await connectDB(process.env.DB_URL); // Await DB connection

  server.use("/api/auth", userRoute);
  server.use("/api/habit", sleepHabitRoute);

  server.get("/", (_req, res) => {
    res.send("API is Running....");
  });

  server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
  });
};

startServer();

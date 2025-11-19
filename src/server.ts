import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';
import userRoute from './routes/authRoute';
import sleepHabitRoute from './routes/habits/sleepHabitRoute';

const server = express();
dotenv.config(); // Load Dotenv files
server.use(express.json())

connectDB(process.env.DB_URL) // Connect the Database (Mongodb Cluster)

server.use('/api/auth', userRoute)
server.use('/api/habit', sleepHabitRoute)


server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
})
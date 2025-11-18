import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';
import userRoute from './routes/AuthRoute';
import { json } from 'stream/consumers';

const server = express();
dotenv.config(); // Load Dotenv files
server.use(express.json())

connectDB(process.env.DB_URL) // Connect the Database (Mongodb Cluster)

server.use('/api', userRoute)


server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
})
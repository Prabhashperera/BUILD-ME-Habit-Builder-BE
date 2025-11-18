import dotenv from 'dotenv';
import express from 'express'
import connectDB from './util/db/connectDB';

const server = express();
dotenv.config(); // Load Dotenv files

connectDB(process.env.DB_URL) // Connect the Database (Mongodb Cluster)


server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
})
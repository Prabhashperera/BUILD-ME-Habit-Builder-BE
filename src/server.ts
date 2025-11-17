import dotenv from 'dotenv';
import express from 'express'

const server = express();
dotenv.config();


server.listen(process.env.PORT, () => {
    console.log("Server Started On : " + process.env.PORT);
})
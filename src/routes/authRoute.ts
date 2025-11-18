import express from 'express'
import { signupUser } from '../controller/authController';

const userRoute = express.Router();

userRoute.post('/signup', signupUser)


export default userRoute
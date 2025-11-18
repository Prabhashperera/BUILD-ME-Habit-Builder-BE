import express from 'express'
import { loginUser, signupUser } from '../controller/authController';
import { hashPassword } from '../middlewares/bcryptPassword';

const userRoute = express.Router();

userRoute.post('/signup', hashPassword, signupUser)
userRoute.post('/login', loginUser)


export default userRoute
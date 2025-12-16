import express from 'express'
import { getData, loginUser, refreshAccessToken, signupUser } from '../controller/authController';
import { hashPassword } from '../middlewares/bcryptPassword';
import { jwtAuthCheckToken } from '../jwt/jwtAuth';

const userRoute = express.Router();

userRoute.post('/signup', hashPassword, signupUser)
userRoute.post('/login', loginUser)
userRoute.get('/data', jwtAuthCheckToken, getData)
userRoute.post('/refresh-token', refreshAccessToken)


export default userRoute
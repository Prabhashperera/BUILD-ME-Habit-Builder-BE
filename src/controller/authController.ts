import { Request, Response } from "express";
import UserModel from "../model/userModel";


const loginUser = (req: Request, res: Response) => {

}


export const signupUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body
        const user = new UserModel({
            userName: userData.userName,
            email: userData.email,
            password: userData.password
        })
        const savedUser = await user.save()
        res.status(201).json({
            message: "User Saved Success",
            data: savedUser
        })

    } catch (error) {
        res.status(500).json({
            message: "User Saved Failed",
            errors: error
        })
    }
}
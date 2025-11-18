import { Request, Response } from "express";
import UserModel from "../model/userModel";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const loginUser = async (req: Request, res: Response) => {
    try {

        const { email, password, userName } = req.body;
        if (!email || !password) { return res.status(400).json({ message: "Fill all the Fields" }); }

        // Get the USer Data
        const foundUser = await UserModel.findOne({ email })
        if (!foundUser) { return res.status(400).json({ message: "User not found" }); }

        const isMatch = await bcrypt.compare(password, foundUser.password)
        if (!isMatch) { return res.status(400).json({ message: "Password not Match" }); }

        const SECRET_KEY = process.env.SECRET_KEY as string;

        const token = jwt.sign(
            {
                userId: foundUser._id,
                userName: foundUser.userName,
                email: foundUser.email
            },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(201).json({ message: "Login Success", data: { userName, email, token } });

    } catch (error) {
        res.status(400).json({ message: "Error While Comparing Passwords", error });
    }
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


export const getData = async (req: Request, res: Response) => {
    res.send(req.user)
}
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
        if (!foundUser) { return res.status(404).json({ message: "User not found" }); }

        const isMatch = await bcrypt.compare(password, foundUser.password)
        if (!isMatch) { return res.status(401).json({ message: "Password not Match" }); }

        const SECRET_KEY = process.env.SECRET_KEY as string;
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;


        const accessToken = jwt.sign(
            {
                userId: foundUser._id,
                userName: foundUser.userName,
                email: foundUser.email
            },
            SECRET_KEY,
            { expiresIn: "1m" }
        );

        const refreshToken = jwt.sign(
            {
                userId: foundUser._id
            },
            REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )

        foundUser.refreshToken = refreshToken
        await foundUser.save()

        return res.status(201).json({ message: "Login Success", data: { userName, email, accessToken, refreshToken } });

    } catch (error) {
        res.status(400).json({ message: "Error While Logging in", error });
    }
}


export const signupUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body
        const hashedPassword = await bcrypt.hash(userData.password, 10) //Hashed Password

        const user = new UserModel({
            userName: userData.userName,
            email: userData.email,
            password: hashedPassword
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

// Generate Acces Token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body
        console.log("BODY REACHED REFRESH TOKEN")


        if (!refreshToken) return res.status(401).json({ message: "No refresh token" })

        const user = await UserModel.findOne({ refreshToken })
        if (!user) return res.status(403).json({ message: "Invalid refresh token" })

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: any, decoded: any) => {
            if (err) return res.status(403).json({ message: "Refresh token expired" })

            const newAccessToken = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.SECRET_KEY!,
                { expiresIn: "15m" }
            )
            console.log(newAccessToken + "CREATED!!!!!!!!!");

            res.json({ accessToken: newAccessToken })
        })
    } catch (err: any) {
        res.send(err.message)
    }
}

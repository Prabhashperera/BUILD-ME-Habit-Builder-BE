import { Request, Response } from "express";
import UserModel from "../model/userModel";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library"


export const loginUser = async (req: Request, res: Response) => {
    try {

        const { email, password, userName } = req.body;
        if (!email || !password) { return res.status(400).json({ message: "Fill all the Fields" }); }

        // Get the USer Data
        const foundUser = await UserModel.findOne({ email })
        if (!foundUser) { return res.status(404).json({ message: "User not found" }); }

        if (!foundUser.password) {
            // Google login user or password not set
            return res.status(400).json({ message: "Please login with Google" });
        }

        // Only run bcrypt if password exists
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!isMatch || !foundUser.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
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
            { expiresIn: "30m" }
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

    } catch (error:any) {
        res.status(500).json({
            message: "User Saved Failed",
            errors: error?.message
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
                { expiresIn: "30m" }
            )
            console.log(newAccessToken + "CREATED!!!!!!!!!");

            res.json({ accessToken: newAccessToken })
        })
    } catch (err: any) {
        res.send(err.message)
    }
}

// Google Login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const googleAuth = async (req:Request, res:Response) => {
    try {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ message: "Google token missing" })
        }

        // 1. Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID!,
        })

        const payload = ticket.getPayload()

        const email = payload?.email
        const googleId = payload?.sub
        const name = payload?.name
        const avatar = payload?.picture

        if (!email) {
            return res.status(400).json({ message: "Google account has no email" })
        }

        // 2. Find user by email
        let user = await UserModel.findOne({ email })

        if (user) {
            // 3. Link Google account if not linked
            if (!user.googleId) {
                user.googleId = googleId as string
                user.authProvider = "GOOGLE"
                user.avatar = avatar as string
                await user.save()
            }
        } else {
            // 4. Create new user
            user = await UserModel.create({
                email,
                googleId: googleId,
                authProvider: "GOOGLE",
                name,
                avatar,
            })
        }

        // 5. Generate tokens (same as normal login)
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.SECRET_KEY as string,
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET as string,
            { expiresIn: "7d" }
        )

        // 6. Respond
        res.status(200).json({
            accessToken,
            refreshToken,
            email: user.email,
        })

    } catch (error) {
        console.error("Google auth error:", error)
        res.status(401).json({ message: "Google authentication failed" })
    }
}


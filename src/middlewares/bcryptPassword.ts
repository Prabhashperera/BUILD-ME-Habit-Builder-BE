import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'
import UserModel from "../model/userModel";

// Convert To Hash Password
export const hashPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password } = req.body
        if (!password) { return next() }

        const hashedPassword = await bcrypt.hash(password, 12)
        req.body.password = hashedPassword
        next();

    } catch (error) {
        res.status(500).json({
            message: "Error While Brcypting Password",
            error
        })
    }
}

// // Verify Password By Checking
// export const comparePassword = async (req: Request, res: Response, next: NextFunction) => {
//     try {

//         const { email, password } = req.body;
//         if (!email || !password) { return res.status(400).json({ message: "Fill all the Fields" }); }

//         // Get the USer Data
//         const foundUser = await UserModel.findOne({ email })
//         if (!foundUser) { return res.status(400).json({ message: "User not found" }); }

//         const isMatch = await bcrypt.compare(password, foundUser.password)
//         if (isMatch) { return res.status(201).json({ message: "User Matched", data: { email } }); }

//     } catch (error) {
//         res.status(400).jsosn({ message: "Error While Comparing Passwords", error });
//     }
//     next();
// }
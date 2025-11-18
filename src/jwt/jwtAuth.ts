import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const jwtAuthCheckToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.get("Authorization")?.split(" ")[1] as string
        console.log(accessToken);
        const SECRET_KEY = process.env.SECRET_KEY as string

        if (!accessToken) {
            throw new Error('Missing access token');
        }

        const deocode = jwt.verify(accessToken, SECRET_KEY) as any
        if (deocode) {
            console.log(deocode, accessToken);
            req.user = deocode;
            next();
        }

    } catch (error) {
        res.status(500).json({
            message: "Error while Verifying Token",
            error
        })
    }
}
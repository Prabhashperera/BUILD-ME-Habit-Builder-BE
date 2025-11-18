import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    userName: string,
    email: string,
    password: string
}

const userModel: Schema<IUser> = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },

}, { timestamps: true });

const UserModel = mongoose.model<IUser>("User", userModel);
export default UserModel
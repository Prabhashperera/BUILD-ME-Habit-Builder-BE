import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    userName?: string,
    email: string,
    password?: string,
    googleId?: string,
    authProvider?: "EMAIL" | "GOOGLE",
    avatar?: string,
    refreshToken?: string
}

const userModel: Schema<IUser> = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: function() {
            return !this.googleId; // required only if not Google user
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: function() {
            return !this.googleId; // required only if not Google user
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // allows multiple nulls
    },
    authProvider: {
        type: String,
        enum: ["EMAIL", "GOOGLE"],
        default: "EMAIL"
    },
    avatar: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    }

}, { timestamps: true });

const UserModel = mongoose.model<IUser>("User", userModel);
export default UserModel;

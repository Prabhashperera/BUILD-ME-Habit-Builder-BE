import mongoose, { Document, Schema } from "mongoose";

export interface ISleepCycle extends Document {
    userId: mongoose.Schema.Types.ObjectId,
    dailyLogs: {
        date: Date,
        sleptAt: string,
        wokeAt: string,
        sleptInWindow: boolean,
        wokeInWindow: boolean,
        pointsAwarded: number,
        aiAdvice?: string
    }[];
    aiAnalysis?: string; // Final AI analysis

}

// Daily Logs Seperation
const dailyLogsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    sleptAt: { type: String },
    wokeAt: { type: String },
    sleptInWindow: { type: Boolean },
    wokeInWindow: { type: Boolean },
    pointsAwarded: { type: Number },
    aiAdvice: { type: String },
}, { _id: false })

// Sleep Cycle With Daly logs Intergration
const sleepCycleHabit: Schema<ISleepCycle> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    dailyLogs: [dailyLogsSchema],
    // 🧠 Final AI Analysis for the whole habit
    aiAnalysis: {
        type: String,
    },
}, { timestamps: true });

const SleepCycleModel = mongoose.model<ISleepCycle>("SleepCycleModel", sleepCycleHabit)
export default SleepCycleModel
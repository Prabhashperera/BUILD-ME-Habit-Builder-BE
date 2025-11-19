import { Request, Response } from "express";
import GenAi from "../../config/geminiConfig";

const SLEEP_START = "21:00"; // 9 PM
const SLEEP_END = "22:00";   // 10 PM

const WAKE_START = "06:00";  // 6 AM
const WAKE_END = "07:00";    // 7 AM

function timeToMinutes(time: string) {
    const parts = time.split(":");
    const hours = Number(parts[0] ?? 0);   // fallback to 0 if undefined
    const minutes = Number(parts[1] ?? 0); // fallback to 0 if undefined
    return hours * 60 + minutes;
}

function isInTimeWindow(time: string, start: string, end: string) {
    const cTime = timeToMinutes(time)
    const cStart = timeToMinutes(start)
    const cEnd = timeToMinutes(end)

    return cTime >= cStart && cTime <= cEnd
}

function calculatePoints(isSleptInWindow: boolean, isWokeInWindow: boolean) {
    return isSleptInWindow && isWokeInWindow ? 2 : isSleptInWindow || isWokeInWindow ? 1 : 0
}

async function geminiDailyAdvice(sleptAt: string, wokeAt: string) {
    const prompt = `The user slept at ${sleptAt} and woke at ${wokeAt}.
    but i given sleep hour is arround ${SLEEP_START} - ${SLEEP_END},
    and the wakeup time i gven to him is ${WAKE_START} - ${WAKE_END}.
    Give a friendly, advice for improving him to sleep habits.`

    const response = await GenAi.models.generateContent({
        model: "gemini-2.5-pro", //gemini-2.5-flash-lite
        contents: prompt
    })
    return response
}

const saveDailyLog = (req: Request, res: Response) => {
    try {
        const currentDate = new Date("2025-01-01").getFullYear(); // Current Date
        const userId = req.user //Current User ID
        const { sleptAt, wokeAt } = req.body //All The Request Data
        const isSleptInWindow = isInTimeWindow(sleptAt, SLEEP_START, SLEEP_END) // isSleptInWindow
        const isWokeInWindow = isInTimeWindow(wokeAt, WAKE_START, WAKE_END) // isWokeInWindow
        const pointsAwarded = calculatePoints(isSleptInWindow, isWokeInWindow) // returns Awarded Points
        const dailyAdvice = geminiDailyAdvice(sleptAt, wokeAt) // Returns the Gemini Response

    } catch (error) {
        res.send("error" + error)
    }
}
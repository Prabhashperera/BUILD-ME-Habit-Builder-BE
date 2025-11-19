import { Request, Response } from "express";
import GenAi from "../../config/geminiConfig";

interface Part {
    text?: string;       // the main text
    // maybe other fields like image, role, etc. depending on SDK version
}

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

async function geminiDailyAdvice(sleptAt: string, wokeAt: string, userName: string) {
    const prompt = `The ${userName} slept at ${sleptAt} and woke at ${wokeAt}.
    but i given sleep hour is arround ${SLEEP_START} - ${SLEEP_END},
    and the wakeup time i gven to him is ${WAKE_START} - ${WAKE_END}.
    Give a friendly,funny,short advice for improving him to sleep habits (dont give introductions, just give the advice).`

    // const models = await GenAi.models.list();
    // console.log(models);

    const model = GenAi.getGenerativeModel({
        model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result;


}

export const saveDailyLog = async (req: Request, res: Response) => {
    try {

        console.log("API KEY:", process.env.API_KEY_AI);
        if (!process.env.API_KEY_AI) return res.status(500).send("API key missing");


        const currentDate = new Date("2025-01-01").getFullYear(); // Current Date
        const userId = req.user //Current User ID
        const { sleptAt, wokeAt } = req.body //All The Request Data
        const isSleptInWindow = isInTimeWindow(sleptAt, SLEEP_START, SLEEP_END) // isSleptInWindow
        const isWokeInWindow = isInTimeWindow(wokeAt, WAKE_START, WAKE_END) // isWokeInWindow
        const pointsAwarded = calculatePoints(isSleptInWindow, isWokeInWindow) // returns Awarded Points
        const dailyAdvice = await geminiDailyAdvice(sleptAt, wokeAt, "prabash") // Returns the Gemini Response

        console.log(currentDate, userId, sleptAt, wokeAt);
        console.log(isSleptInWindow, isWokeInWindow, pointsAwarded);
        console.log("Advice : " + dailyAdvice);
        res.status(200).json({
            sleptAt,
            wokeAt,
            isSleptInWindow,
            isWokeInWindow,
            pointsAwarded,
            advice: dailyAdvice
        })


    } catch (error) {
        res.send("error" + error)
    }
}
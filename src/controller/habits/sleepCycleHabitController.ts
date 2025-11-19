import { Request, Response } from "express";
import GenAi from "../../config/geminiConfig";
import SleepCycleModel from "../../model/habits/sleepCycleHabit";

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
    const prompt = `Hey ${userName}! I see you slept at ${sleptAt} and woke up at ${wokeAt}. 
    Your ideal sleep window is around ${SLEEP_START} - ${SLEEP_END}, 
    and your ideal wake-up window is ${WAKE_START} - ${WAKE_END}. 
    Give me a short, friendly, and funny tip to help me improve my sleep habits. 
    Keep it casual, encouraging, and the last give a tip or tips according to the situation 
    and skip any introductions (use simple english words) — just the advice!`;

    // const models = await GenAi.models.list();
    // console.log(models);

    const model = GenAi.getGenerativeModel({
        model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();

}

// MAIN FUNCTION THAT SAVE ALL THINGS
export const saveDailyLog = async (req: Request, res: Response) => {
    try {
        const userID = req.user?.userId
        const foundLogs = await SleepCycleModel.findOne({ userID })
        const CURRENT_DAYS_OF_HABBT = foundLogs?.dailyLogs.length as number
        if (CURRENT_DAYS_OF_HABBT == 30) { return res.status(502).json({ message: "Challenge Days Are Over" }) }

        console.log("API KEY:", process.env.API_KEY_AI);
        if (!process.env.API_KEY_AI) return res.status(500).send("API key missing");


        const date = new Date(); // today
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        const currentDate = `${year}-${month}-${day}`;
        const userId = req.user?.userId //Current User ID
        const { sleptAt, wokeAt } = req.body //All The Request Data
        const isSleptInWindow = isInTimeWindow(sleptAt, SLEEP_START, SLEEP_END) // isSleptInWindow
        const isWokeInWindow = isInTimeWindow(wokeAt, WAKE_START, WAKE_END) // isWokeInWindow
        const pointsAwarded = calculatePoints(isSleptInWindow, isWokeInWindow) // returns Awarded Points
        const dailyAdvice = await geminiDailyAdvice(sleptAt, wokeAt, "prabash") // Returns the Gemini Response

        console.log(currentDate, userId, sleptAt, wokeAt);
        console.log(isSleptInWindow, isWokeInWindow, pointsAwarded);
        console.log("Advice : " + dailyAdvice);

        const savedDailyLog = await SleepCycleModel.findOneAndUpdate(
            { userId }, // find doc by user
            {
                $push: {
                    dailyLogs: {
                        date: currentDate,
                        sleptAt,
                        wokeAt,
                        sleptInWindow: isSleptInWindow,
                        wokeInWindow: isWokeInWindow,
                        pointsAwarded,
                        aiAdvice: dailyAdvice
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Log Saved Success",
            data: { savedDailyLog }
        })


    } catch (error) {
        res.status(500).json({
            message: "Log Savng Failed",
            error
        })
    }
}

// Returns the current days of did logged
export const getCurrentDay = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        const foundLogs = await SleepCycleModel.findOne({ userId })
        const CURRENT_DAYS_OF_HABBT = foundLogs?.dailyLogs.length as number
        res.status(200).json({
            message: "Dates Counted",
            data: CURRENT_DAYS_OF_HABBT
        })

    } catch (error) {
        res.status(500).json({
            message: "Internel Server Error",
            error
        })
    }
}
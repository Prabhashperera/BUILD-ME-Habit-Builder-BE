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
    Your ideal sleep window is ${SLEEP_START} - ${SLEEP_END}, 
    and your ideal wake-up window is ${WAKE_START} - ${WAKE_END}.

    Compare the times I actually slept/woke to the ideal window and give me a short, friendly, and funny tip on how to adjust my sleep tonight or tomorrow morning to fit the ideal window. 
    Be very specific: if I slept too late, suggest going to bed earlier; if I woke too late, suggest ways to wake up on time. 
    Skip introductions, use simple English, make it encouraging and actionable.`;


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

        // console.log("API KEY:", process.env.API_KEY_AI);
        if (!process.env.API_KEY_AI) return res.status(500).send("API key missing");


        // Get today’s real date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const currentDateString = `${yyyy}-${mm}-${dd}`;
        const currentDate = new Date(currentDateString);


        const userId = req.user?.userId //Current User ID
        const { sleptAt, wokeAt } = req.body //All The Request Data
        const isSleptInWindow = isInTimeWindow(sleptAt, SLEEP_START, SLEEP_END) // isSleptInWindow
        const isWokeInWindow = isInTimeWindow(wokeAt, WAKE_START, WAKE_END) // isWokeInWindow
        const pointsAwarded = calculatePoints(isSleptInWindow, isWokeInWindow) // returns Awarded Points
        const dailyAdvice = await geminiDailyAdvice(sleptAt, wokeAt, "prabash") // Returns the Gemini Response

        console.log(currentDate, userId, sleptAt, wokeAt);
        console.log(isSleptInWindow, isWokeInWindow, pointsAwarded);
        console.log("Advice : " + dailyAdvice);

        // Checks the Daily Logs from User and find IsAlready Logged Today
        const userLogs = await SleepCycleModel.findOne({ userId });
        const todayDateWithoutTime = new Date().toISOString().split("T")[0] as string
        const alreadyLogged = userLogs?.dailyLogs.some(log =>
            log.date.toISOString().startsWith(todayDateWithoutTime)
        );

        // This is Holding the Daily Log, Only Users Can One Daily Log per Day
        // if (alreadyLogged) {
        //     return res.status(500).json({
        //         message: "Today Logges Over",
        //     })
        // }

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

        // Remove this after  deployement -----------------------------------------------------------------
        const todayLogs = savedDailyLog.dailyLogs.filter(
            log => log.date.toISOString().startsWith(currentDateString)
        );

        // get the latest one
        const todayLog = todayLogs[todayLogs.length - 1];
        // Remove this after  deployement -----------------------------------------------------------------


        res.status(200).json({
            message: "Log Saved Success",
            data: { todayLog }
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


// Check Is Logged Today
export const checkIsLoggedToday = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId //Current User ID
        // Checks the Daily Logs from User and find IsAlready Logged Today
        const userLogs = await SleepCycleModel.findOne({ userId });
        const todayDateWithoutTime = new Date().toISOString().split("T")[0] as string
        const alreadyLogged = userLogs?.dailyLogs.some(log =>
            log.date.toISOString().startsWith(todayDateWithoutTime)
        );

        if (alreadyLogged) {
            res.status(200).json({
                message: "User Already Logged Today!!",
                data: true
            })
        } else {
            res.status(200).json({
                message: "User NOT Logged Today!!",
                data: false
            })
        }

    } catch (error) {
        res.status(502).json({
            message: "Error While checking Logged Today!!",
            error
        })
    }
}
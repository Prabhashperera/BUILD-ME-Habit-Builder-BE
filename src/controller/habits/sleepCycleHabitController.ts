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
        model: "gemini-2.5-flash",
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
        // 

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


// Get the User Progress
export const getProgressData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId

        const userLogData = await SleepCycleModel.findOne({ userId })
        const currentDays = userLogData?.dailyLogs.length as number  //Current Days 
        const currentPoints = userLogData?.dailyLogs.reduce((total, log) => {
            return total + Number(log.pointsAwarded)
        }, 0)
        const progress = Math.round((currentDays / 30) * 100)

        res.status(200).json({
            message: "Progress Counted Successfully",
            data: {
                "sleep": { "currentDays": currentDays, "currentPoints": currentPoints, "progress": progress, "type": "sleep" },
                "eat": { "currentDays": 2, "currentPoints": 10, "progress": 6, "type": "eat" },
                "read": { "currentDays": 7, "currentPoints": 25, "progress": 23, "type": "read" },
                "gym": { "currentDays": 4, "currentPoints": 15, "progress": 13, "type": "gym" }
            }
        })

    } catch (error) {
        res.send(error)
    }
}


// Get All the User Logs
export const getAllUserLogs = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        const userLogData = await SleepCycleModel.findOne({ userId })
        const userLogs = userLogData?.dailyLogs
        res.status(200).json({
            message: "User Logs Data",
            data: { userLogs }
        })

    } catch (err) {
        res.send(err)

    }
}


// Sleep Habit End Analysis
export const generateFinalAnalysis = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        const allLoggedData = await SleepCycleModel.findOne({ userId })

        const prompt = `
        ${allLoggedData}

        You are analyzing a user's sleep habit challenge data.

        User name: ${req.user?.userName}

        Challenge rules:
        - Sleep between ${SLEEP_START} and ${SLEEP_END}
        - Wake between ${WAKE_START} and ${WAKE_END}
        - Each log gives a maximum of 2 points

        Tasks:
        1. Calculate statistics:
        - Average sleep time (HH:mm)
        - Average wake time (HH:mm)
        - Total points
        - Best-performing day (date with highest points)

        2. Calculate consistency:
        - Number of days sleep window was met
        - Number of days wake window was met
        - Number of days both were met
        - Total number of log entries
        - Average points per log

        3. Provide insights:
        - 2–3 strengths
        - 2–3 improvement areas
        - 3–4 simple actionable tips

        IMPORTANT OUTPUT RULES:
        - Respond ONLY in valid JSON
        - No markdown
        - No emojis
        - No extra text
        - No explanations
        - Values must be short and UI-friendly

        Return JSON in this exact format:

        {
        "overview": {
            "averageSleepTime": "HH:mm",
            "averageWakeTime": "HH:mm",
            "totalPoints": number,
            "bestDay": "YYYY-MM-DD"
        },
        "consistency": {
            "sleepWindowHits": number,
            "wakeWindowHits": number,
            "bothWindowHits": number,
            "totalLogs": number,
            "averageScore": number
        },
        "strengths": [
            "string",
            "string"
        ],
        "improvements": [
            "string",
            "string"
        ],
        "tips": [
            "string",
            "string",
            "string"
        ]
        }
        `;



        const model = GenAi.getGenerativeModel({
            model: "gemini-2.5-flash",
        });
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        res.status(201).json({
            message: "Generated Final Analysis",
            data: result.response.text()
        })


    } catch (err: any) {
        res.send(err.message)
    }
}
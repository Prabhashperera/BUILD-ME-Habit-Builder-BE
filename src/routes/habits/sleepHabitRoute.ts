import express from 'express'
import { checkIsLoggedToday, generateFinalAnalysis, getAllUserLogs, getCurrentDay, getFinalAiAnalysis, getProgressData, saveDailyLog, saveFinalAiAnalysis } from '../../controller/habits/sleepCycleHabitController'
import { jwtAuthCheckToken } from '../../jwt/jwtAuth'

const sleepHabitRoute = express.Router()

sleepHabitRoute.post("/save", jwtAuthCheckToken, saveDailyLog)
sleepHabitRoute.get("/getcurrentdate", jwtAuthCheckToken, getCurrentDay)
sleepHabitRoute.get("/checkisloggedtoday", jwtAuthCheckToken, checkIsLoggedToday)
sleepHabitRoute.get("/sleepprogress", jwtAuthCheckToken, getProgressData)
sleepHabitRoute.get("/getuserAllLogs", jwtAuthCheckToken, getAllUserLogs)
sleepHabitRoute.get("/generatefinalanalysis", jwtAuthCheckToken, generateFinalAnalysis)
sleepHabitRoute.get("/getFinalAiAnalysis", jwtAuthCheckToken, getFinalAiAnalysis)
sleepHabitRoute.post("/saveFinalAiAnalysis", jwtAuthCheckToken, saveFinalAiAnalysis)
// sleepHabitRoute.get("/testgroq", testGroqConnection)

export default sleepHabitRoute
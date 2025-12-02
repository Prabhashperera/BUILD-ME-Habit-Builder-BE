import express from 'express'
import { checkIsLoggedToday, getAllUserLogs, getCurrentDay, getProgressData, saveDailyLog } from '../../controller/habits/sleepCycleHabitController'
import { jwtAuthCheckToken } from '../../jwt/jwtAuth'

const sleepHabitRoute = express.Router()

sleepHabitRoute.post("/save", jwtAuthCheckToken, saveDailyLog)
sleepHabitRoute.get("/getcurrentdate", jwtAuthCheckToken, getCurrentDay)
sleepHabitRoute.get("/checkisloggedtoday", jwtAuthCheckToken, checkIsLoggedToday)
sleepHabitRoute.get("/sleepprogress", jwtAuthCheckToken, getProgressData)
sleepHabitRoute.get("/getuserAllLogs", jwtAuthCheckToken, getAllUserLogs)

export default sleepHabitRoute
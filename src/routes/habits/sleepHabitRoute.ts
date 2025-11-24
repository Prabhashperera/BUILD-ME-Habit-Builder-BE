import express from 'express'
import { checkIsLoggedToday, getCurrentDay, saveDailyLog } from '../../controller/habits/sleepCycleHabitController'
import { jwtAuthCheckToken } from '../../jwt/jwtAuth'

const sleepHabitRoute = express.Router()

sleepHabitRoute.post("/save", jwtAuthCheckToken, saveDailyLog)
sleepHabitRoute.get("/getcurrentdate", jwtAuthCheckToken, getCurrentDay)
sleepHabitRoute.get("/checkisloggedtoday", jwtAuthCheckToken, checkIsLoggedToday)

export default sleepHabitRoute
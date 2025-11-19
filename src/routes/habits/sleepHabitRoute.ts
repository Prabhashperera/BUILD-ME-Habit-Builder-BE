import express from 'express'
import { getCurrentDay, saveDailyLog } from '../../controller/habits/sleepCycleHabitController'
import { jwtAuthCheckToken } from '../../jwt/jwtAuth'

const sleepHabitRoute = express.Router()

sleepHabitRoute.post("/save", jwtAuthCheckToken, saveDailyLog)
sleepHabitRoute.get("/getcurrentdate", jwtAuthCheckToken, getCurrentDay)

export default sleepHabitRoute
import express from 'express'
import { saveDailyLog } from '../../controller/habits/sleepCycleHabitController'
import { jwtAuthCheckToken } from '../../jwt/jwtAuth'

const sleepHabitRoute = express.Router()

sleepHabitRoute.post("/save", jwtAuthCheckToken, saveDailyLog)

export default sleepHabitRoute
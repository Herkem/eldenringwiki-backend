'use strict'

// Imports
import { Router } from 'express'
import { getUserAchievements, addUserAchievement, deleteUserAchievement } from '../controller/user_achievement.controller.js'

const router = Router()

// CRUD
router.post('/:id', getUserAchievements)
router.post('/', addUserAchievement)
router.delete('/:id', deleteUserAchievement)

export default router

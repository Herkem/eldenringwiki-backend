'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllAchievements, getAchievement, getImage, addAchievement, updateAchievement, deleteAchievement } from '../controller/achievement.controller.js'

const router = Router()

// CRUD
router.get('/', getAllAchievements)
router.get('/id=:id', getAchievement)
router.get('/image=:image', getImage)
router.post('/', mf.upload.single('image'), addAchievement)
router.put('/:id', mf.upload.single('image'), updateAchievement)
router.delete('/:id', deleteAchievement)

export default router

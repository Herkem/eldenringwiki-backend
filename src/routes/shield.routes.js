'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllShields, getShieldCategories, getAllShieldsByCategory,  getImage, getShield, addShield, deleteShield } from '../controller/shield.controller.js'

const router = Router()

// CRUD
router.get('/', getAllShields)
router.get('/shields_categories', getShieldCategories)
router.get('/category=:category', getAllShieldsByCategory)
router.get('/image=:image', getImage)
router.get('/:id', getShield)
router.post('/', mf.upload.single('image'), addShield)
router.delete('/:id', deleteShield)

export default router

'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllWeapons, getWeaponCategories, getAllWeaponsByCategory, getImage, getWeapon, addWeapon, deleteWeapon } from '../controller/weapon.controller.js'

const router = Router()

// CRUD
router.get('/', getAllWeapons)
router.get('/weapons_categories', getWeaponCategories)
router.get('/category=:category', getAllWeaponsByCategory)
router.get('/image=:image', getImage)
router.get('/:id', getWeapon)
router.post('/', mf.upload.single('image'), addWeapon)
router.delete('/:id', deleteWeapon)

export default router

'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllClasses, getImage, addClass, updateClass, deleteClass } from '../controller/class.controller.js'

const router = Router()

// CRUD
router.get('/', getAllClasses)
router.get('/image=:image', getImage)
router.post('/', mf.upload.single('image'), addClass)
router.put('/:id', mf.upload.single('image'), updateClass)
router.delete('/:id', deleteClass)

export default router

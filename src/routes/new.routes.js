'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllNews, getImage, addNew, updateNew, deleteNew } from '../controller/new.controller.js'

const router = Router()

// CRUD
router.get('/', getAllNews)
router.get('/image=:image', getImage)
router.post('/', mf.upload.single('image'), addNew)
router.put('/:id', mf.upload.single('image'), updateNew)
router.delete('/:id', deleteNew)

export default router

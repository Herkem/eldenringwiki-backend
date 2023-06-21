'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllAshes, getImage, getAsh, getAllAffinities, addAsh, updateAsh, deleteAsh } from '../controller/ash.controller.js'

const router = Router()

// CRUD
router.get('/', getAllAshes)
router.get('/image=:image', getImage)
router.get('/id=:id', getAsh)
router.get('/affinities', getAllAffinities)
router.post('/', mf.upload.single('image'), addAsh)
router.put('/:id', mf.upload.single('image'), updateAsh)
router.delete('/:id', deleteAsh)

export default router

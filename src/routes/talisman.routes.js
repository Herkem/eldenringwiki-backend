'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllTalismans, getImage, getTalisman, addTalisman, updateTalisman, deleteTalisman } from '../controller/talisman.controller.js'

const router = Router()

// CRUD
router.get('/', getAllTalismans)
router.get('/image=:image', getImage)
router.get('/:id', getTalisman)
router.post('/', mf.upload.single('image'), addTalisman)
router.put('/:id', mf.upload.single('image'), updateTalisman)
router.delete('/:id', deleteTalisman)

export default router

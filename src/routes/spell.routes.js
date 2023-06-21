'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllSpells, getSpellCategories, getAllSpellsByCategory, getImage, getSpell, addSpell, updateSpell, deleteSpell } from '../controller/spell.controller.js'

const router = Router()

// CRUD
router.get('/', getAllSpells)
router.get('/spells_categories', getSpellCategories)
router.get('/category=:category', getAllSpellsByCategory)
router.get('/image=:image', getImage)
router.get('/:id', getSpell)
router.post('/', mf.upload.single('image'), addSpell)
router.put('/:id', mf.upload.single('image'), updateSpell)
router.delete('/:id', deleteSpell)

export default router

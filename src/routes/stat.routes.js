'use strict'

// Imports
import { Router } from 'express'
import { getAllStats, addStat, updateStat, deleteStat } from '../controller/stat.controller.js'

const router = Router()

// CRUD
router.get('/', getAllStats)
router.post('/', addStat)
router.put('/:id', updateStat)
router.delete('/:id', deleteStat)

export default router

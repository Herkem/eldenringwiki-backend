'use strict'

// Imports
import { Router } from 'express'
import { getUserEquipment, addUserEquipment, deleteUserEquipment } from '../controller/user_equipment.controller.js'

const router = Router()

// CRUD
router.post('/:id', getUserEquipment)
router.post('/', addUserEquipment)
router.delete('/:id', deleteUserEquipment)

export default router

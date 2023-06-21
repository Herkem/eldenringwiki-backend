'use strict'

// Imports
import { Router } from 'express'
import mf from '../middleware/manageFile.js'
import { getAllUsers, getUser, getImage, validateUser, logout, getPassword, register, login, updateUserGeneral, updateUserPassword, updateUserRole, deleteUser } from '../controller/user.controller.js'

const router = Router()

// CRUD
router.get('/', getAllUsers)
router.get('/id=:id', getUser)
router.get('/image=:image', getImage)
router.get('/validateUser', validateUser)
router.get('/logout', logout)
router.post('/password', getPassword)
router.post('/register', register)
router.post('/login', login)
router.put('/updateGeneral/:id', updateUserGeneral)
router.put('/updatePassword/:id', updateUserPassword)
router.put('/updateRole/:id', updateUserRole)
router.delete('/:id', deleteUser)

export default router

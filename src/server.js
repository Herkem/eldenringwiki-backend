'use strict'

// Imports
import express from 'express'
import cors from 'cors'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// App
const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  key: 'user',
  secret: 'secret', // a secret key used to encrypt the session cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24, // Cookies last one day
    httpOnly: true, 
  } // set the session cookie properties
}))

// Settings
app.set('json spaces', 2)

// Importing routes
import talismansRoutes from './routes/talisman.routes.js'
import classesRoutes from './routes/class.routes.js'
import statsRoutes from './routes/stat.routes.js'
import usersRoutes from './routes/user.routes.js'
import achievementsRoutes from './routes/achievement.routes.js'
import ashesRoutes from './routes/ash.routes.js'
import spellsRoutes from './routes/spell.routes.js'
import weaponsRoutes from './routes/weapon.routes.js'
import shieldsRoutes from './routes/shield.routes.js'
import newsRoutes from './routes/new.routes.js'
import usersAchievementsRoutes from './routes/user_achievements.routes.js'
import usersEquipmentRoutes from './routes/user_equipment.routes.js'

// View Engine
app.use('/api/talismans', talismansRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/achievements', achievementsRoutes)
app.use('/api/spells', spellsRoutes)
app.use('/api/weapons', weaponsRoutes)
app.use('/api/shields', shieldsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/ashes', ashesRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/users_achievements', usersAchievementsRoutes)
app.use('/api/users_equipment', usersEquipmentRoutes)

// Not found route
app.use((req, res) => {
  res.json({ succes: false, message: 'endpoint not found'})
})

// Starting the server
app.listen(3001)
console.log(`Server running on port ${PORT}`)

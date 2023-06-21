'use strict'

// Imports
import { pool } from '../database.js'

// All achievements are displayed by user id
export const getUserAchievements = async (req, res) => {
  const [rows] = await pool.query('select idUser, idAchievement from achievements_achieved where idUser = ? and idAchievement = ?', [req.params.id, req.body.idAchievement])

  if (rows.length <= 0) return res.json({ exists: false })
  res.json({ exists: true })
}

// An achievement is added to a user
export const addUserAchievement = async (req, res) => {
  await pool.query('insert into achievements_achieved values (?, ?)', [req.body.id, req.body.idAchievement])

  res.send({
    idUser: req.params.id,
    idAchievement: req.body.idAchievement,
  })
}

// An achievement is deleted for a user
export const deleteUserAchievement = async (req, res) => {
  const [result] = await pool.query('delete from achievements_achieved where idUser = ? and idAchievement = ?', [req.params.id, req.body.data.idAchievement])

  if (result.affectedRows <= 0) return res.json({ success: false, message: 'User not found' })

  res.json({ succes: true, message: 'Achievement deleted' })
}

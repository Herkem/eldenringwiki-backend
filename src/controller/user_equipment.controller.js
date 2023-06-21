'use strict'

// Imports
import { pool } from '../database.js'

// All equipment is displayed by user id
export const getUserEquipment = async (req, res) => {
  const [rows] = await pool.query('select idUser, idEquipment from equipment_achieved where idUser = ? and idEquipment = ?', [req.params.id, req.body.idEquipment])

  if (rows.length <= 0) return res.json({ exists: false })
  res.json({ exists: true })
}

// A equipment is added to a user
export const addUserEquipment = async (req, res) => {
  await pool.query('insert into equipment_achieved values (?, ?)', [req.body.id, req.body.idEquipment])

  res.send({
    idUser: req.params.id,
    idEquipment: req.body.idEquipment,
  })
}

// A equipment is deleted for a user
export const deleteUserEquipment = async (req, res) => {
  const [result] = await pool.query('delete from equipment_achieved where idUser = ? and idEquipment = ?', [req.params.id, req.body.data.idEquipment])

  if (result.affectedRows <= 0) return res.json({ success: false, message: 'User not found' })

  res.json({ succes: true, message: 'Equipment deleted' })
}

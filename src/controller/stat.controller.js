'use strict'

// Imports
import { pool } from '../database.js'

// All stats are displayed
export const getAllStats = async (req, res) => {
  const [rows] = await pool.query('select idStat id, name, description from stats')
  res.json(rows)
}

// A stat is added
export const addStat = async (req, res) => {
  const { name, description } = req.body

  const [rows] = await pool.query('insert into stats (name, description) values (?, ?)', [name, description])

  res.send({
    id: rows.insertId,
    name: name,
    description: description
  })
}

// A stat is updated
export const updateStat = async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body

  const [result] = await pool.query('update stats set name = ?, description = ? where idStat = ?', [name, description, id])

  if (result.affectedRows <= 0) return res.status(404).json({ message: 'Stat not found' })

  const [rows] = await pool.query('select * from stats where idStat = ?', [id])
  res.json(rows[0])
}

// A stat is deleted
export const deleteStat = async (req, res) => {
  const [result] = await pool.query('delete from stats where idStat = ?', [req.params.id])

  if (result.affectedRows <= 0) return res.json({ succes:false, message: 'Stat not found' })

  res.send('Stat deleted')
}

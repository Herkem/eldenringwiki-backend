'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All achievements are displayed
export const getAllAchievements = async (req, res) => {
  const [rows] = await pool.query('select * from achievements')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].idAchievement,
      name: rows[i].name,
      obtaining: rows[i].obtaining,
      image: `http://localhost:3001/api/achievements/image=${rows[i].image}`
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

// A single achievement is displayed by its id
export const getAchievement = async (req, res) => {
  const [rows] = await pool.query('select * from achievements where idAchievement = ?', [req.params.id])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Achievement not found' })

  res.json({
    id: rows[0].idAchievement,
    name: rows[0].name,
    obtaining: rows[0].obtaining,
    image: `http://localhost:3001/api/achievements/image=${rows[0].image}`,
  })
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from achievements where image like ?', [req.params.image])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/achievements/${rows[0].image}`)
}

// An achievement is added
export const addAchievement = async (req, res) => {
  const { name, obtaining } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/achievements/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const [rows] = await pool.query('insert into achievements (name, obtaining, image) values (?, ?, ?)', [name.toUpperCase(), obtaining, imageRename])

    res.send({
      idAchievement: rows.insertId,
      name: name,
      obtaining: obtaining,
      image: imageRename
    })
  })
}

// An achievement is updated
export const updateAchievement = async (req, res) => {
  const { id } = req.params
  const { name, obtaining } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  const [rows] = await pool.query('select name, image from achievements where idAchievement = ?', [id])

  if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
    fs.unlink(`./public/uploads/achievements/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
    fs.rename(`./public/uploads/${image}`, `./public/uploads/achievements/${imageRename}`, (err) => {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  const [result] = await pool.query('update achievements set name = ?, obtaining = ?, image = ? where idAchievement = ?', [name, obtaining, imageRename, id])

  if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Achievement not found' })

  res.json({ succes: true, message: 'Achievement updated' })
}

// An achievement is deleted
export const deleteAchievement = async (req, res) => {

  const [rows] = await pool.query('select image from achievements where idAchievement = ?', [req.params.id])

  fs.unlink(`./public/uploads/achievements/${rows[0].image}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from achievements where idAchievement = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Achievement not found' })

    res.json({ succes: true, message: 'Achievement deleted' })
  })
}

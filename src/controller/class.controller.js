'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All classes are displayed
export const getAllClasses = async (req, res) => {
  const [rows] = await pool.query('select * from classes')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const [stats] = await pool.query('select statLevel level from classes_stats where idClass = ?', rows[i].idClass)

    const json = {
      id: rows[i].idClass,
      name: rows[i].name,
      description: rows[i].description,
      level: rows[i].level,
      stats: {
        VIGOR: stats[0].level,
        MIND: stats[1].level,
        ENDURANCE: stats[2].level,
        STRENGTH: stats[3].level,
        DEXTERITY: stats[4].level,
        INTELLIGENCE: stats[5].level,
        FAITH: stats[6].level,
        ARCANE: stats[7].level
      },
      image: `http://localhost:3001/api/classes/image=${rows[i].image}`
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from classes where image like ?', [req.params.image])

  if (rows.length <= 0) return res.status(404).json({ message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/classes/${rows[0].image}`)
}

// A class is added
export const addClass = async (req, res) => {
  const { name, description, level, vigor, mind, endurance, strength, dexterity, intelligence, faith, arcane } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/classes/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await pool.query('insert into classes (name, description, level, image) values (?, ?, ?, ?)', [name.toUpperCase(), description, level, imageRename])

      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 1, vigor])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 2, mind])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 3, endurance])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 4, strength])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 5, dexterity])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 6, intelligence])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 7, faith])
      await pool.query('insert into classes_stats values (?, ?, ?)', [rows.insertId, 8, arcane])

      res.send({
        id: rows.insertId,
        name: name,
        description: description,
        level: level,
        vigor: vigor,
        mind: mind,
        endurance: endurance,
        strength: strength,
        dexterity: dexterity,
        intelligence: intelligence,
        faith: faith,
        arcane: arcane,
        image: imageRename
      })

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      console.log(error)
      res.json({ succes: false, message: 'Oh no something went wrong...' })
    }
  })
}

// A class is updated
export const updateClass = async (req, res) => {
  const { id } = req.params
  const { name, description, level, vigor, mind, endurance, strength, dexterity, intelligence, faith, arcane } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  const [rows] = await pool.query('select name, image from classes where idClass = ?', [id])

  if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
    fs.unlink(`./public/uploads/classes/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
    fs.rename(`./public/uploads/${image}`, `./public/uploads/classes/${imageRename}`, (err) => {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await pool.query('update classes set name = ?, description = ?, level = ?, image = ? where idClass = ?', [name, description, level, imageRename, id])

    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [vigor, id, 1])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [mind, id, 2])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [endurance, id, 3])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [strength, id, 4])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [dexterity, id, 5])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [intelligence, id, 6])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [faith, id, 7])
    await pool.query('update classes_stats set statLevel = ? where idClass = ? and idStat = ?', [arcane, id, 8])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Class not found' })

    res.json({ succes: true, message: 'Class updated' })

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    console.log(error)
    res.json({ succes: false, message: 'Oh no something went wrong...' })
  }
}

// A class is deleted
export const deleteClass = async (req, res) => {
  const [rows] = await pool.query('select image from classes where idClass = ?', [req.params.id])

  fs.unlink(`./public/uploads/classes/${rows[0].image}`, async (err) => {
    const [result] = await pool.query('delete from classes where idClass = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Class not found' })

    res.json({ succes: true, message: 'Class deleted' })
  })
}

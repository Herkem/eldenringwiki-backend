'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All talismans are displayed
export const getAllTalismans = async (req, res) => {
  const [rows] = await pool.query('select * from talismans_info')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].id,
      name: rows[i].name,
      location: rows[i].location,
      effect: rows[i].effect,
      weight: rows[i].weight,
      image: `http://localhost:3001/api/talismans/image=${rows[i].image}`,
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from talismans_info where image like ?', [req.params.image])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/talismans/${rows[0].image}`)
}

// A single talisman is displayed by its id
export const getTalisman = async (req, res) => {
  const [rows] = await pool.query('select * from talismans_info where id = ?', [req.params.id])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Talisman not found' })

  res.json({
    id: rows[0].id,
    name: rows[0].name,
    location: rows[0].location,
    effect: rows[0].effect,
    weight: rows[0].weight,
    image: `http://localhost:3001/api/talismans/image=${rows[0].image}`,
  })
}

// A talisman is added
export const addTalisman = async (req, res) => {
  const { name, location, effect, weight } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/talismans/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await pool.query('insert into equipment (name, location, image) values (?, ?, ?)', [name.toUpperCase(), location, imageRename])

      await pool.query('insert into talismans values (?, ?, ?)', [rows.insertId, effect, weight])

      res.send({
        id: rows.insertId,
        name: name,
        location: location,
        effect: effect,
        weight: weight,
        image: imageRename
      })

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      res.json({ succes: false, message: 'Oh no something went wrong...' })
    }
  })
}

// A talisman is updated
export const updateTalisman = async (req, res) => {
  const { id } = req.params
  const { name, location, effect, weight } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  const [rows] = await pool.query('select name, image from talismans_info where id = ?', [id])

  if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
    fs.unlink(`./public/uploads/talismans/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
    fs.rename(`./public/uploads/${image}`, `./public/uploads/talismans/${imageRename}`, (err) => {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await pool.query('update equipment set name = ?, location = ?, image = ? where idEquipment = ?', [name.toUpperCase(), location, imageRename, id])

    await pool.query('update talismans set effect = ?, weight = ? where idEquipment = ?', [effect, weight, id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Talisman not found' })

    res.json({ succes: true, message: 'Talisman updated' })

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    console.log(error)
    res.json({ succes: false, message: 'Oh no something went wrong...' })
  }

}

// A talisman is deleted
export const deleteTalisman = async (req, res) => {
  const [rows] = await pool.query('select image from talismans_info where id = ?', [req.params.id])

  fs.unlink(`./public/uploads/talismans/${rows[0].image}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from equipment where idEquipment = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Talisman not found' })

    res.json({ succes: true, message: 'Talisman deleted' })
  })
}

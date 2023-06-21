'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All ashes are displayed
export const getAllAshes = async (req, res) => {
  const [rows] = await pool.query('select * from ashes_info')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].id,
      name: rows[i].name,
      location: rows[i].location,
      affinity: rows[i].affinity,
      effect: rows[i].effect,
      image: `http://localhost:3001/api/ashes/image=${rows[i].image}`,
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from equipment where image like ?', [req.params.image])

  if (rows.length <= 0) return res.status(404).json({ message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/ashes/${rows[0].image}`)
}

// A single ash is displayed by its id
export const getAsh = async (req, res) => {
  const [rows] = await pool.query('select * from ashes_info where id = ?', [req.params.id])

  if (rows.length <= 0) return res.status(404).json({ message: 'Ash not found' })

  res.json({
    id: rows[0].id,
    name: rows[0].name,
    location: rows[0].location,
    affinity: rows[0].affinity,
    effect: rows[0].effect,
    image: `http://localhost:3001/api/ashes/image=${rows[0].image}`,
  })
}

// A single ash is displayed by its id
export const getAllAffinities = async (req, res) => {
  const [rows] = await pool.query('select distinct(affinity) from ashes_info')

  res.json(rows)
}

// An ash is added
export const addAsh = async (req, res) => {
  const { name, location, affinity, effect } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/ashes/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await pool.query('insert into equipment (name, location, image) values (?, ?, ?)', [name.toUpperCase(), location, imageRename])
      await pool.query('insert into ashes values (?, ?, ?)', [rows.insertId, affinity, effect])

      res.send({
        id: rows.insertId,
        name: name,
        location: location,
        affinity: affinity,
        effect: effect,
        image: imageRename
      })

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      console.log(error)
      res.status(404).json({ message: 'Oh no something went wrong...' })
    }
  })

}

// An ash is updated
export const updateAsh = async (req, res) => {
  const { id } = req.params
  const { name, location, affinity, effect } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  const [rows] = await pool.query('select name, image from ashes_info where id = ?', [id])

  if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
    fs.unlink(`./public/uploads/ashes/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
    fs.rename(`./public/uploads/${image}`, `./public/uploads/ashes/${imageRename}`, (err) => {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await pool.query('update equipment set name = ?, location = ?, image = ? where idEquipment = ?', [name, location, imageRename, id])
    await pool.query('update ashes set affinity = ?, effect = ? where idEquipment = ?', [affinity, effect, id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Ash not found' })

    res.json({ succes: true, message: 'Ash updated' })

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    console.log(error)
    res.json({ succes: false, message: 'Oh no something went wrong...' })
  }
}

// An ash is deleted
export const deleteAsh = async (req, res) => {
  const [rows] = await pool.query('select image from ashes_info where id = ?', [req.params.id])

  fs.unlink(`./public/uploads/ashes/${rows[0].image}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from ashes where idEquipment = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Ash not found' })

    res.json({ succes: true, message: 'Ash deleted' })
  })
}

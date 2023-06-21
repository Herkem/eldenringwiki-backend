'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All of weapons are displayed
export const getAllSpells = async (req, res) => {
  const [rows] = await pool.query('select * from spells_info')
  res.send(rows)
}

// All spells are displayed by its category
export const getSpellCategories = async (req, res) => {
  const [rows] = await pool.query('select distinct category from spells_info order by 1')
  res.send(rows)
}

// All spells are displayed
export const getAllSpellsByCategory = async (req, res) => {
  const [rows] = await pool.query('select id, name, image from spells_info where category = ?', [req.params.category])

  if (rows.length <= 0) return res.status(404).json({ message: 'Category not found' })

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].id,
      name: rows[i].name,
      image: `http://localhost:3001/api/spells/image=${rows[i].image}`
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from equipment where image like ?', [req.params.image])

  if (rows.length <= 0) return res.status(404).json({ message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/spells/${rows[0].image}`)
}

// A single spell is displayed by its id
export const getSpell = async (req, res) => {
  const [rows] = await pool.query('select * from spells_info where id = ?', [req.params.id])

  if (rows.length <= 0) return res.status(404).json({ message: 'Spell not found' })

  res.json({
    id: rows[0].id,
    name: rows[0].name,
    location: rows[0].location,
    effect: rows[0].effect,
    cost: rows[0].cost,
    slots: rows[0].slots,
    image: `http://localhost:3001/api/spells/image=${rows[0].image}`,
  })
}

// A spell is added
export const addSpell = async (req, res) => {
  const { name, location, category, effect, cost, slots } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/spells/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await pool.query('insert into equipment (name, location, image) values (?, ?, ?)', [name.toUpperCase(), location, imageRename])
      await pool.query('insert into spells values (?, ?, ?, ?, ?)', [rows.insertId, category, effect, cost, slots])

      res.send({
        id: rows.insertId,
        name: name,
        location: location,
        category: category,
        effect: effect,
        cost: cost,
        slots: slots,
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

// A spell is updated
export const updateSpell = async (req, res) => {
  const { id } = req.params
  const { name, location, category, effect, cost, slots } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  const [rows] = await pool.query('select name, image from spells_info where id = ?', [id])

  if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
    fs.unlink(`./public/uploads/spells/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
    fs.rename(`./public/uploads/${image}`, `./public/uploads/spells/${imageRename}`, (err) => {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [result] = await pool.query('update equipment set name = ?, location = ?, image = ? where idEquipment = ?', [name.toUpperCase(), location, imageRename, id])
    await pool.query('update spells set category = ?, effect = ?, cost = ?, slots = ? where idEquipment = ?', [category, effect, cost, slots, id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Spell not found' })

    res.json({ succes: true, message: 'Spell updated' })

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    console.log(error)
    res.json({ succes: false, message: 'Oh no something went wrong...' })
  }
}

// A spell is deleted
export const deleteSpell = async (req, res) => {
  const [rows] = await pool.query('select image from spells_info where id = ?', [req.params.id])
  
  fs.unlink(`./public/uploads/spells/${rows[0].image}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from spells where idEquipment = ?', [req.params.id])
    
    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Spell not found' })
  
    res.json({ succes: true, message: 'Spell deleted' })
  })
}

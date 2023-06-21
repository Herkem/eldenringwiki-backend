'use strict'

// Imports
import { pool } from '../database.js'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All of weapons are displayed
export const getAllWeapons = async (req, res) => {
  const [rows] = await pool.query('select e.idEquipment id, name, location, category, subcategory, weight, image from equipment e natural join armament a where category = "weapon"')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].id,
      name: rows[i].name,
      location: rows[i].location,
      weight: rows[i].weight,
      scales: {},
      requires: {},
      image: `http://localhost:3001/api/weapons/image=${rows[i].image}`,
    }

    const [scales] = await pool.query('select st.name, scale from scales sc natural join stats st where idEquipment = ?', rows[i].id)

    const [requires] = await pool.query('select st.name, required from requires r natural join stats st where idEquipment = ?', rows[i].id)

    scales.forEach(value => json.scales[value.name] = value.scale)

    requires.forEach(value => json.requires[value.name] = value.required)

    jsonArray.push(json)
  }
  res.json(jsonArray)
}

// All categories of weapons are displayed
export const getWeaponCategories = async (req, res) => {
  const [rows] = await pool.query('select distinct subcategory as category from armament where category = "weapon" order by 1')
  res.send(rows)
}

// All weapons are displayed by category
export const getAllWeaponsByCategory = async (req, res) => {
  const [rows] = await pool.query('select e.idEquipment id, e.name name, image from equipment e natural join armament a where category = "weapon" and subcategory = ?', [req.params.category])

  if (rows.length <= 0) return res.status(404).json({ message: 'Category not found' })

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].id,
      name: rows[i].name,
      image: `http://localhost:3001/api/weapons/image=${rows[i].image}`,
    }
    jsonArray.push(json)
  }

  res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select image from equipment where image like ?', [req.params.image])

  if (rows.length <= 0) return res.status(404).json({ message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/weapons/${rows[0].image}`)
}

// A single weapon is displayed by its id
export const getWeapon = async (req, res) => {
  const [rows] = await pool.query('select e.idEquipment id, e.name name, location, weight, image from equipment e natural join armament a where category = "weapon" and e.idEquipment = ?', [req.params.id])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Weapon not found' })

  const json = {
    idEquipment: rows[0].id,
    name: rows[0].name,
    location: rows[0].location,
    weight: rows[0].weight,
    scales: {},
    requires: {},
    image: `http://localhost:3001/api/weapons/image=${rows[0].image}`,
  }

  const [scales] = await pool.query('select st.name, scale from scales sc natural join stats st where idEquipment = ?', [req.params.id])

  const [requires] = await pool.query('select st.name, required from requires r natural join stats st where idEquipment = ?', [req.params.id])

  scales.forEach(value => json.scales[value.name] = value.scale)

  requires.forEach(value => json.requires[value.name] = value.required)

  res.send(json)
}

// A weapon is added
export const addWeapon = async (req, res) => {
  const { name, location, subcategory, weight, scales, scaling, requires, requirement } = req.body
  const { filename: image } = req.file

  const imageRename = mf.renameImage(name)

  fs.rename(`./public/uploads/${image}`, `./public/uploads/weapons/${imageRename}`, async function (err) {
    if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [rows] = await pool.query('insert into equipment (name, location, image) values (?, ?, ?)', [name.toUpperCase(), location, imageRename])

      await pool.query('insert into armament values (?, "weapon", ?, ?)', [rows.insertId, subcategory, weight])

      await pool.query('insert into scales values (?, (select idStat from stats where name = ?), ?)', [rows.insertId, scales, scaling])

      await pool.query('insert into requires values (?, (select idStat from stats where name = ?), ?)', [rows.insertId, requires, requirement])

      res.json({
        id: rows.insertId,
        name: name,
        location: location,
        subcategory: subcategory,
        weight: weight,
        scales: {
          [scales]: scaling
        },
        requires: {
          [requires]: requirement
        },
        image: image
      })

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      console.log(error)
      res.json({ success: false, message: 'Oh no something went wrong...' })
    }
  })
}

// A weapon is deleted
export const deleteWeapon = async (req, res) => {
  const [rows] = await pool.query('select image from equipment where idEquipment = ?', [req.params.id])

  fs.unlink(`./public/uploads/weapons/${rows[0].image}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from equipment where idEquipment = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'Weapon not found' })

    res.json({ succes: true, message: 'Weapon deleted' })
  })
}

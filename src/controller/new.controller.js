'use strict'

// Imports
import { pool } from '../database.js'
import moment from 'moment'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All news are displayed
export const getAllNews = async (req, res) => {
    const [rows] = await pool.query('select * from news')

    const jsonArray = []

    for (let i = 0; i < rows.length; i++) {
        const json = {
            id: rows[i].idNew,
            name: rows[i].name,
            date: rows[i].date,
            image: `http://localhost:3001/api/news/image=${rows[i].image}`,
        }

        jsonArray.push(json)
    }

    res.json(jsonArray)
}

//An images is displayed by its name
export const getImage = async (req, res) => {
    const [rows] = await pool.query('select image from news where image like ?', [req.params.image])

    if (rows.length <= 0) return res.json({ succes: false, message: 'Image not found' })

    res.sendFile(`${process.cwd()}/public/uploads/news/${rows[0].image}`)
}

// A new is added
export const addNew = async (req, res) => {
    const { name } = req.body
    const { filename: image } = req.file
    const date = moment().format('MMMM Do YYYY')

    const imageRename = mf.renameImage(name)

    fs.rename(`./public/uploads/${image}`, `./public/uploads/news/${imageRename}`, async function (err) {
        if (err) return res.json({ succes: false, message: 'Unable to rename the file' })

        const [rows] = await pool.query('insert into news (name, date, image) values (?, ?, ?)', [name, date, imageRename])

        res.send({
            id: rows.insertId,
            name: name,
            date: date,
            image: imageRename
        })
    })
}

// A new is updated
export const updateNew = async (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const { filename: image } = req.file
    const date = moment().format('MMMM Do YYYY')

    const imageRename = mf.renameImage(name)

    const [rows] = await pool.query('select name, image from news where idNew = ?', [id])

    if (rows[0].name !== name || rows[0].image !== `${image}.png`) {
        fs.unlink(`./public/uploads/news/${rows[0].image}`, (err) => { if (err) return res.json({ succes: false, message: 'Unable to delete the file' }) })
        fs.rename(`./public/uploads/${image}`, `./public/uploads/news/${imageRename}`, (err) => {
            if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
        })
    }

    const [result] = await pool.query('update news set name = ?, date = ?, image = ? where idNew = ?', [name, date, imageRename, id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'New not found' })

    res.json({ succes: true, message: 'New updated' })
}

// A new is deleted
export const deleteNew = async (req, res) => {
    const [rows] = await pool.query('select image from news where idNew = ?', [req.params.id])

  fs.unlink(`./public/uploads/news/${rows[0].image}`, async (err) => {
      const [result] = await pool.query('delete from news where idNew = ?', [req.params.id])
  
      if (result.affectedRows <= 0) return res.json({ succes: false, message: 'New not found' })
  
      res.json({ succes: true, message: 'Talisman deleted' })
  })
}

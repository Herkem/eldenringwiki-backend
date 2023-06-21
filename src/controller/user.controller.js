'use strict'

// Imports
import { pool } from '../database.js'
import bcrypt from 'bcrypt'
import mf from '../middleware/manageFile.js'
import fs from 'fs'

// All users are displayed
export const getAllUsers = async (req, res) => {
  const [rows] = await pool.query('select * from users')

  const jsonArray = []

  for (let i = 0; i < rows.length; i++) {
    const json = {
      id: rows[i].idUser,
      name: rows[i].userName,
      email: rows[i].email,
      image: `http://localhost:3001/api/users/image=${rows[i].imgUser}`,
      role: rows[i].role,
    }

    jsonArray.push(json)
  }

  res.json(jsonArray)
}

// A single user is displayed by its id
export const getUser = async (req, res) => {
  const [rows] = await pool.query('select * from users where idUser = ?', [req.params.id])

  if (rows.length <= 0) return res.json({ succes: false, message: 'User not found' })

  res.json({
    id: rows[0].idUser,
    name: rows[0].userName,
    email: rows[0].email,
    password: rows[0].password,
    role: rows[0].role,
    image: `http://localhost:3001/api/users/image=${rows[0].image}`,
  })
}

//An images is displayed by its name
export const getImage = async (req, res) => {
  const [rows] = await pool.query('select imgUser from users where imgUser like ?', [req.params.image])

  if (rows.length <= 0) return res.json({ succes: false, message: 'Image not found' })

  res.sendFile(`${process.cwd()}/public/uploads/users/${rows[0].imgUser}`)
}

//Validating a user
export const validateUser = (req, res) => {
  if (req.session.user) {
    res.json({ valid: true, user: req.session.user })
  } else {
    res.json({ valid: false })
  }
}

//The session with the user is destroyed
export const logout = (req, res) => {
  req.session.destroy()
  res.json({ success: true })
}

// Checking the user password
export const getPassword = async (req, res) => {
  const { id, email, password } = req.body

  const [rows] = await pool.query('select * from users where idUser = ?', [id])

  if (rows[0].email !== email) return res.json({ success: false, message: 'Email is not correct' })

  bcrypt.compare(password.toString(), rows[0].password, (err, data) => {
    if (err) res.json({ success: false, message: 'Error in node' })

    if (data) {
      res.json({ success: true })
    } else {
      res.json({ success: false, message: 'Password is not correct' })
    }
  })
}

// A user is added
export const register = async (req, res) => {
  const { userName, email, password } = req.body

  const [emails] = await pool.query('select * from users where email = ?', [email])

  if (emails.length > 0) return res.json({ success: false, message: 'Email already exist' })

  const [userNames] = await pool.query('select * from users where userName = ?', [userName])

  if (userNames.length > 0) return res.json({ success: false, message: 'User Name already exist' })

  // The password is encrypted using bcrypt node module
  const hash = bcrypt.hashSync(password.toString(), 10)

  const [rows] = await pool.query('insert into users (userName, email, password, imgUser, role) values (?, ?, ?, ?, ?)', [userName, email, hash, `${userName.toLowerCase()}.png`, 'user'])

  fs.copyFile(`${process.cwd()}/public/uploads/users/userDefault.png`, `${process.cwd()}/public/uploads/users/${userName.toLowerCase()}.png`, (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to create the file' })

    req.session.user = {
      id: rows.insertId,
      userName: userName,
      email: email,
      password: password,
      role: 'user',
      imgUser: `http://localhost:3001/api/users/image=${userName}.png`
    }
    res.json({ success: true })
  })
}

// Checking the login for the user
export const login = async (req, res) => {
  const { email, password } = req.body

  const [rows] = await pool.query('select * from users where email = ?', [email])

  if (rows.length <= 0) return res.json({ success: false, message: 'Email is not correct' })

  // The password inserted for login is compared with the encrypted password in the database
  bcrypt.compare(password.toString(), rows[0].password, (err, data) => {
    if (err) res.json({ success: false, message: 'Error in node' })

    if (data) {
      req.session.user = {
        id: rows[0].idUser,
        userName: rows[0].userName,
        email: rows[0].email,
        password: rows[0].password,
        role: rows[0].role,
        imgUser: `http://localhost:3001/api/users/image=${rows[0].imgUser}`
      }
      res.json({ success: true })
    } else {
      res.json({ success: false, message: 'Password is not correct' })
    }
  })
}

// A user general information is updated
export const updateUserGeneral = async (req, res) => {
  const { id } = req.params
  const { userName, email } = req.body

  const imageRename = mf.renameImage(userName)

  const [rows] = await pool.query('select * from users where idUser = ?', [id])

  if (rows[0].userName !== userName) {
    const [userNames] = await pool.query('select * from users where userName = ? and idUser != ?', [userName, id])

    if (userNames.length > 0) return res.json({ success: false, message: 'User Name already exist' })

    fs.rename(`./public/uploads/users/${rows[0].userName}.png`, `./public/uploads/users/${imageRename}`, async function (err) {
      if (err) return res.json({ succes: false, message: 'Unable to rename the file' })
    })
  }

  if (rows[0].email !== email) {
    const [emails] = await pool.query('select * from users where email = ? and idUser != ?', [email, id])

    if (emails.length > 0) return res.json({ success: false, message: 'Email already exist' })
  }

  const [result] = await pool.query('update users set userName = ?, email = ?, imgUser = ? where idUser = ?', [userName, email, imageRename, id])

  if (result.affectedRows <= 0) return res.json({ success: false, message: 'User not found' })

  req.session.user.userName = userName
  req.session.user.email = email

  res.json({ success: true, message: 'User updated' })
}

// A user password is updated
export const updateUserPassword = async (req, res) => {
  const { id } = req.params
  const { password } = req.body

  const hash = bcrypt.hashSync(password.toString(), 10)

  const [result] = await pool.query('update users set password = ? where idUser = ?', [hash, id])

  if (result.affectedRows <= 0) return res.json({ succes: false, message: 'User not found' })

  req.session.user.password = password

  res.json({ success: true, message: 'User updated' })
}

// A user role is updated
export const updateUserRole = async (req, res) => {
  const { id } = req.params

  const [result] = await pool.query('update users set role = ? where idUser = ?', ['admin', id])

  if (result.affectedRows <= 0) return res.json({ succes: false, message: 'User not found' })

  res.json({ success: true, message: 'User updated' })
}

// A user is deleted
export const deleteUser = async (req, res) => {
  const [rows] = await pool.query('select imgUser from users where idUser = ?', [req.params.id])

  fs.unlink(`./public/uploads/users/${rows[0].imgUser}`, async (err) => {
    if (err) return res.json({ succes: false, message: 'Unable to delete the file' })

    const [result] = await pool.query('delete from users where idUser = ?', [req.params.id])

    if (result.affectedRows <= 0) return res.json({ succes: false, message: 'User not found' })

    if (req.session.user.id === req.params.id) {
      req.session.destroy()
    }
    res.json({ succes: true, message: 'User deleted' })
  })
}

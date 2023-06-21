'use strict'

// Imports
import multer from 'multer'

// Image storage config
const imgConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads')
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  }
})

// Image filter
const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true)
  } else {
    callback(null, Error('Please upload a correct image'))
  }
}

const upload = multer({
  storage: imgConfig,
  fileFilter: isImage
})

const renameImage = (name) => {
  return `${name.toLowerCase().replace(/ /g, '_').replace('\'', '').replace('!', '').replace('-', '')}.png`
}

export default { upload, renameImage }

'use strict'

// Imports
import { createPool } from 'mysql2/promise'

// Database credentials
export const pool = createPool(
  {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'eldenringdb'
  }
)

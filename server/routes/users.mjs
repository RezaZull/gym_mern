import express from 'express'
import db from '../db/conn.mjs'

const router = express.Router()
let col = db.collection('users')
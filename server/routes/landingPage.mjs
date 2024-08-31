import express from 'express'
import db from "../db/conn.mjs"

const router = express.Router()

router.get("/", async (req, res) => {
    let collection = await db.collection("landingPageData")
    let result = await collection.find({}).limit(50).toArray()
    res.status(200).json(result)
})

export default router
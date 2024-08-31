import express from 'express'
import db from '../db/conn.mjs'
import {
    ObjectId
} from 'mongodb'

const router = express.Router()
let col = db.collection('gymClass')

//*select
router.get('/', async (req, res) => {
    let result = await col.find({}).toArray()
    res.status(200).json(result)
})
//*find by id
router.get("/:id", async (req, res) => {
    const getId = req.params.id
    if (getId.length != 24) {
        return res.status(401).json({
            message: "wrong id"
        })
    }
    let query = {
        _id: new ObjectId(req.params.id)
    };
    let result = await col.findOne(query)
    if (!result) {
        res.status(404).json({
            message: "Data Not Found"
        })
    } else {
        res.status(200).json(result)
    }
})
//*create
router.post('/', async (req, res) => {
    let document = req.body
    let result = await col.insertOne(document)
    res.status(200).json(result)
})
//*delete
router.delete('/:id', async (req, res) => {
    const getid = req.params.id
    if (getid.length != 24) {
        return res.status(401).json({
            message: "wrong id "
        })
    }
    const query = {
        _id: new ObjectId(getid)
    }
    let result = col.deleteOne(query)
    res.status(200).json({
        message: "data removed"
    })
})

//*update
router.put('/:id', async (req, res) => {
    const getid = req.params.id
    if (getid.length != 24) {
        return res.status(401).json({
            message: "wrong id "
        })
    }
    const query = {
        _id: new ObjectId(getid)
    }
    const updateData = {
        $set: {
            ...req.body
        },
        $unset: {}
    }
    let result = col.updateOne(query, updateData)
    res.status(200).json(result)
})
export default router
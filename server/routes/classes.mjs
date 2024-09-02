import express from 'express'
import db from '../db/conn.mjs'
import {
    body,
    validationResult
} from 'express-validator'
import {
    ObjectId
} from 'mongodb'

const router = express.Router()
let col = db.collection('class')

const validator = [
    body('*.name', 'name is required').notEmpty(),
    body('*.desc', 'desc is required').notEmpty(),
    body('*.price', 'price is required').notEmpty(),
    body('*.exercise', 'exercise is required').notEmpty(),
]

router.get("/", async (req, res) => {
    let data = await col.find().toArray()
    res.status(200).send({
        message: "success read data",
        data: data
    })
})
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
    let data = await col.findOne(query)
    if (!data) {
        res.status(404).json({
            message: "Data Not Found"
        })
    } else {
        res.status(200).send({
            message: "success read data",
            data: data
        })
    }
})

router.post('/', validator, async (req, res) => {
    const mode = req.query.mode
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        if (mode == "bulk") {
            await col.insertMany(req.body)
        } else {
            await col.insertOne(req.body)
        }
        res.status(200).send({
            message: "success insert data"
        })
    } else {
        res.status(400).send({
            message: "failed insert data",
            errors: validatorErr.array()
        })
    }
})

const deleteValidator = [body("_ids", "_ids required").notEmpty(), body("_ids", "_ids must be array").isArray()]
router.delete('/', deleteValidator, async (req, res) => {
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        let dataBody = []
        req.body._ids.map((_id, idx) => {
            if (ObjectId.isValid(_id)) {
                dataBody.push(new ObjectId(_id + ""))
            }
        })
        const result = await col.deleteMany({
            _id: {
                $in: dataBody
            }
        })
        res.status(200).send({
            message: "success delete datas",
            data: result
        })
    } else {
        res.status(401).send({
            message: "failed delete datas",
            errors: validatorErr.array()
        })
    }
})

const editValidator = [
    body('_ids', '_ids required').notEmpty(),
    body('_ids', '_ids must be array').isArray(),
    body('data', 'data required').notEmpty()
]
router.put('/', editValidator, async (req, res) => {
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        let dataIds = []
        req.body._ids.map((_id, idx) => {
            if (ObjectId.isValid(_id)) {
                dataIds.push(new ObjectId(_id + ''))
            }
        })
        const query = {
            "_id": {
                $in: dataIds
            }
        }
        const updateData = {
            $set: req.body.data,
            $unset: {}
        }
        const result = await col.updateMany(query, updateData)
        res.status(200).send({
            message: 'success update data',
            data: result
        })
    } else {
        res.status(401).send({
            message: 'failed update data',
            errors: validatorErr.array()
        })
    }
})
const editBulkValidator = [
    body('*._id', '_id required').notEmpty(),
    body('*.data', 'data required').notEmpty()
]
router.put('/bulk', editBulkValidator, async (req, res) => {
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        let query = []
        req.body.map((data, idx) => {
            if (ObjectId.isValid(data._id))
                query.push({
                    updateOne: {
                        "filter": {
                            _id: new ObjectId(data._id + "")
                        },
                        "update": {
                            $set: data.data
                        }
                    }
                })
        })

        const result = await col.bulkWrite(query)
        res.status(200).send({
            message: 'success bulk update',
            data: result
        })

    } else {
        res.status(401).send({
            message: 'failed bulk update',
            errors: validatorErr.array()
        })
    }
})
export default router
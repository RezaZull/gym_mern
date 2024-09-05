import express from "express"
import db from "../db/conn.mjs"
import {
    body,
    validationResult
} from "express-validator"
import {
    ObjectId
} from "mongodb"

const router = express.Router()
const col = db.collection("exercises")


router.get('/', async (req, res) => {
    const query = req.body || {}
    let data = await col.find(query).toArray()
    res.status(200).send({
        message: "success read data",
        data: data
    })
})

router.get('/:id', async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
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
const insertValidation = [
    body('*.name', 'name is required').notEmpty(),
    body('*.desc', 'desc is required').notEmpty(),
    body('*.advantages', 'advantages is required').notEmpty(),
    body('*.procedures', 'procedures is required').notEmpty(),

]
router.post('/', insertValidation, async (req, res) => {
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        const result = await col.insertMany(req.body)
        res.status(200).send({
            message: "success insert data",
            data: result
        })
    } else {
        res.status(401).send({
            message: "failed insert datas",
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
const updateProceduresValidator = [
    body('_id', '_id is required').notEmpty(),
    body('_method', '_method is required').notEmpty(),
    body('data', 'data is required').notEmpty()
]
router.put("/procedures", updateProceduresValidator, async (req, res) => {
    const validatorErr = validationResult(req)
    if (validatorErr.isEmpty()) {
        const find = {
            _id: new ObjectId(req.body._id + '')
        }
        switch (req.body._method) {
            case "post":
                const queryInsertProcedure = {
                    $push: {
                        procedures: {
                            procedure_id: new ObjectId(),
                            ...req.body.data
                        }
                    }
                }
                const resultInsert = await col.updateOne(find, queryInsertProcedure)
                res.status(200).send({
                    message: "success update procedure",
                    data: resultInsert
                })
                break;
            case "delete":
                const queryDeleteProcedure = {
                    $pull: {
                        'procedures': {
                            procedure_id: new ObjectId(req.body.data.procedure_id)
                        }
                    }
                }
                const resultDelete = await col.updateOne(find, queryDeleteProcedure)
                res.status(200).send({
                    message: "success delete procedure",
                    data: resultDelete
                })
                break;

            case "put":

                break;
            default:
                res.status(401).send({
                    message: "failed update procedure _method not correct"
                })
                break;
        }
    } else {
        res.status(401).send({
            message: "fail update Procedure",
            errors: validatorErr.array()
        })
    }
})
export default router
import {
    MongoClient
} from "mongodb"
import dotenv from "dotenv"
dotenv.config()

const CONNECTION_STRING = process.env.DB_CONNECT || ""
const client = new MongoClient(CONNECTION_STRING)
let conn;

try {
    conn = await client.connect()
} catch (err) {
    console.error(err)
}

let db = conn.db("gymDB")
export default db;
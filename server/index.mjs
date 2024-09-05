import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import landingPage from "./routes/landingPage.mjs"
import gymClass from "./routes/gymClass.mjs"
import classes from "./routes/classes.mjs"
import branch from "./routes/branch.mjs"
import exercises from "./routes/exercises.mjs"


dotenv.config()
const PORT = process.env.PORT || 5051;
const app = express();

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({
        message: "hello world"
    })
})

app.use("/landingpage", landingPage)
app.use("/gymclass", gymClass)
app.use("/classes", classes)
app.use("/branch", branch)
app.use("/exercises", exercises)

app.listen(PORT, () => {
    console.log(`Server listening to port ${PORT}`)
})
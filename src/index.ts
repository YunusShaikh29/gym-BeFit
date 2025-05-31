import express from 'express'
import {config} from 'dotenv'
import { database } from './prisma'
import { router as loginRouter } from './routes/authHandler'

config()

const PORT = process.env.PORT || 8080

const app = express()

app.use(express.json())


app.use("/login", loginRouter)

app.listen(PORT, () => {
    console.log("server listening on port: ",PORT)
})
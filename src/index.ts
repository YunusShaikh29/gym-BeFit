import express from 'express'
import {config} from 'dotenv'
import { database } from './prisma'
import { router as loginRouter } from './routes/authHandler'
import { memberRoutes } from './routes/membersHandler'
import { dashboardRoutes } from './routes/dashboard'

config()

const PORT = process.env.PORT || 8080

const app = express()

app.use(express.json())


app.use("/login", loginRouter)
app.use("/members", memberRoutes)
app.use('/dashboard', dashboardRoutes)

app.listen(PORT, () => {
    console.log("server listening on port: ",PORT)
})
import express from 'express'
import {config} from 'dotenv'

config()

const PORT = process.env.PORT || 8080

const app = express()

app.get('/server-check', (req, res) => {
    res.json({
        message: 'healthy server'
    })
})

app.listen(PORT, () => {
    console.log("server listening on port: ",PORT)
})
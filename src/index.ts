import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
// Routes imports
import auth from './auth'

// Dotenv
dotenv.config()
const port = process.env.PORT
const secret = process.env.SECRET || 'dev secret'

const app = express()
mongoose.connect(process.env.MONGO_URI!)

// Plugins
app.use(bodyParser.json())
app.use(cookieParser(secret))
app.use(passport.initialize())

// Routes
app.use('/auth', auth)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

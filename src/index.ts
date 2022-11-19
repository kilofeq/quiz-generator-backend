import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
// Routes imports
import auth from './auth'
import articles from './articles'
import quiz from './quiz'

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
app.use('/articles', articles)
app.use('/quiz', quiz)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

import express from 'express'
import sessions from 'express-session'
import cookieParser from 'cookie-parser'
import * as dotenv from 'dotenv'
import mongoose from 'mongoose'
// Routes imports
import auth from './auth'

const app = express()
mongoose.connect(process.env.MONGO_URI!)

// Dotenv
dotenv.config()
const port = process.env.PORT
const secret = process.env.SECRET || 'dev secret'

// Plugins
app.use(sessions({
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
}))
app.use(cookieParser(secret))

// Routes
app.use('/auth', auth)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

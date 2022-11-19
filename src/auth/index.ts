import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.model'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import * as dotenv from 'dotenv'
const router = express.Router()
dotenv.config()

// env variables
const secret = String(process.env.SECRET)
const passwordSaltRounds = Number(
	process.env.PASSWORD_SALT_ROUNDS
)
const passportJwtOptions = {
	expiresIn: Number(process.env.JWT_EXPIRES_IN),
	issuer: process.env.JWT_ISSUER,
	audience: process.env.JWT_AUDIENCE,
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret
}
const jwtOptions = {
	expiresIn: Number(process.env.JWT_EXPIRES_IN),
	issuer: process.env.JWT_ISSUER,
	audience: process.env.JWT_AUDIENCE
}

// Pasport strategy
passport.use(new JwtStrategy(passportJwtOptions, (jwt_payload, done) => {
	User.findById(jwt_payload._id).then(user => {
		if (!user) {
			done(null, false)
			return
		}
		const {
			password,
			...userWithoutPassword
		} = user.toObject()
    done(null, userWithoutPassword)
	}).catch(error => {
		done(error, false)
	})
}))
passport.serializeUser((user: any, done) => {
  done(null, user._id)
})
passport.deserializeUser((_id: string, done) => {
	User.findById(_id).then(user => {
		if (!user) {
			done(null, user)
			return
		}
		const {
			password,
			...userWithoutPassword
		} = user.toObject()
    done(null, userWithoutPassword)
	}).catch(error => {
		done(error, null)
	})
})

// Get user route
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
	res.send(req.user)
})

// Login route
router.post('/login', async (req, res) => {
	const {
		email,
		password: loginPassword
	} = req.body
	if (!email || !loginPassword) {
		res.status(401).send({
			message: 'Missing email or password'
		})
		return
	}
	const user = await User.findOne({
		email
	})
	if (!user) {
		res.status(401).send({
			message: 'User not found'
		})
		return
	}
	const passwordMatch = await bcrypt.compare(
		loginPassword,
		user.password
	)
	if (!passwordMatch) {
		res.status(401).send({
			message: 'Wrong password'
		})
		return
	}
	const {
		password,
		...userWithoutPassword
	} = user.toObject()
	const bearerToken = jwt.sign(userWithoutPassword, secret, jwtOptions)
	res.status(200).send({
		bearerToken
	})
})

// Register route
router.post('/register', async (req, res) => {
	const {
		email,
		password: registerPassword
	} = req.body
	const userExists = await User.exists({
		email
	})
	if (userExists) {
		res.status(409).send({
			message: 'User already exists'
		})
		return
	}
	const hashedPassword = await bcrypt.hash(registerPassword, passwordSaltRounds)
	const newUser = new User({
		email,
		password: hashedPassword
	})
	const newUserDocument = await newUser.save()
	const {
		password,
		...userWithoutPassword
	} = newUserDocument.toObject()
	const bearerToken = jwt.sign(userWithoutPassword, secret, jwtOptions)
	res.status(200).send({
		token: bearerToken
	})
})

export default router

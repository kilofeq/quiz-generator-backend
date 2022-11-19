import express from 'express'
const router = express.Router()

router.get('/user', async (req, res) => {
	// TODO: Getting user auth state
})

router.post('/login', async (req, res) => {
	// TODO: Login user
})

router.post('/register', async (req, res) => {
	// TODO: Create user account
})

export default router

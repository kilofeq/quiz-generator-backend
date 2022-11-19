import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import pdf from 'pdf-parse'
import { generateQuestionsAnswersByContext } from '../helpers/generateQuestionsAnswersByContext'

const router = express.Router()
dotenv.config()

router.use('/generate', async (req, res) => {
	const user = req.user
	/*
	if (!user) {
		res.status(403).send({
			message: 'Forbidden'
		})
		return
	}
	 */
	if (
		!Array.isArray(req.body.urls)
	) {
		res.status(400).send({
			message: 'Urls are not provided'
		})
		return
	}
	const urls = req.body.urls.map((url: string) => String(url)) as string[]
	const articleTextPromises = await Promise.allSettled(urls.map(async url => {
		const response = await axios.get(url, {
			responseType: 'arraybuffer'
		})
		const parsedPdf = await pdf(response.data)
		return parsedPdf.text
	}))
	const articleTexts = articleTextPromises.map(
		promise => promise.status === 'fulfilled' ? promise.value : null
	).filter(Boolean)
	const questionsAnswersPromises = await Promise.allSettled(articleTexts.map(async articleText => {
		if (articleText) {
			return await generateQuestionsAnswersByContext(articleText)
		}
	}))
	const questionsAnswers = questionsAnswersPromises.map(
		promise => promise.status === 'fulfilled' ? promise.value : null
	).filter(Boolean)
	res.status(200).send(questionsAnswers)
})

export default router

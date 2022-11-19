import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import pdf from 'pdf-parse'
import translateText from '../helpers/adapters/translateText'
import generateQuestion from '../helpers/adapters/generateQuestion'
import getAnswerByQuestionAndContext from '../helpers/adapters/getAnswerByQuestionAndContext'
import { generateQuestionsAnswersByContext } from '../helpers/generateQuestionsAnswersByContext'
const router = express.Router()
dotenv.config()

router.use('/generate', async (req, res) => {
	const user = req.user
	if (!user) {
		res.status(403).send({
			message: 'Forbidden'
		})
		return
	}
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
	let answers = []
	for (const articleText of articleTexts) {
		if (
			typeof articleText === 'undefined' ||
			articleText === null
		) {
			continue
		}
		const questionAnswer = await generateQuestionsAnswersByContext(articleText)
		answers.push(questionAnswer)
	}
	res.status(200).send(answers)
})

export default router

import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import pdf from 'pdf-parse'
import translateText from '../helpers/adapters/translateText'
import generateQuestion from '../helpers/adapters/generateQuestion'
import getAnswerByQuestionAndContext from '../helpers/adapters/getAnswerByQuestionAndContext'
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
	const parsedText = articleTexts[0]?.replace(/(\r\n|\n|\r)/gm, ' ').replace(/(„|”)/g, '"')
	const translatedText = await translateText(parsedText || '', 'pl')
	const question = await generateQuestion(translatedText)
	const answer = await getAnswerByQuestionAndContext(question, translatedText)
	const answers = [{
		question: await translateText(question, 'en'),
		answers: [
			{
				text: await translateText(answer, 'en'),
				isCorrect: true
			}
		]
	}]
	res.status(200).send(answers)
})

export default router

import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import pdf from 'pdf-parse'
import { generateQuestionsAnswersByContext } from '../helpers/generateQuestionsAnswersByContext'

const router = express.Router()
dotenv.config()

function chunkSubstr(str: string, size: number) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}

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
	const articlesTextPromises = await Promise.allSettled(urls.map(async url => {
		const response = await axios.get(url, {
			responseType: 'arraybuffer'
		})
		const parsedPdf = await pdf(response.data)
		return parsedPdf.text
	}))
	const articlesTexts = articlesTextPromises.map(
		promise => promise.status === 'fulfilled' ? promise.value : null
	).filter(Boolean) as string[]
	const articleTextsChunks = articlesTexts.flatMap(articleText => chunkSubstr(articleText, 8000))
	const questionsAnswersPromises = await Promise.allSettled(articleTextsChunks.map(
		chunk => generateQuestionsAnswersByContext(chunk)
	))
	const questionsAnswers = questionsAnswersPromises.map(
		promise => promise.status === 'fulfilled' ? promise.value : null
	).filter(Boolean)
	res.status(200).send(questionsAnswers)
})

export default router

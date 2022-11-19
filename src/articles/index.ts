import express from 'express'
import * as dotenv from 'dotenv'
import axios from 'axios'
import * as cheerio from 'cheerio'
import pdf from 'pdf-parse'
const router = express.Router()
dotenv.config()

router.use('/search', async (req, res) => {
	const {
		query,
		size
	} = req.query
	if (
		typeof query !== 'string'
	) {
		res.status(400).send({
			message: 'Wrong query string'
		})
		return
	}
	const ipnSearchUrl = String(process.env.IPN_SEARCH_URL)
	const response = await axios.get(ipnSearchUrl, {
		params: {
			q: encodeURIComponent(query),
			size,
			site: '',
			sort: 'date%3AD%3AL%3Ad1'
		}
	})
	const $ = cheerio.load(response.data)
	const articles: {
		title: string
		url: string
	}[] = []
	$('.res-item').each((_index, element) => {
		const item = $(element)
		const aChild = item.children('a')
		articles.push({
			title: aChild.text(),
			url: String(aChild.first().attr('href'))
		})
	})
	res.send({
		articles
	})
})

export default router

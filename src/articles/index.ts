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
			doctype: 'PDF',
			sort: 'date%3AD%3AL%3Ad1',
			filters: 'eyJXc3p5c3RraWVfc3Ryb255Ijo3MTI5LCJwYWdlc19jZW50cmFsYWlwbl9lbiI6MzMwNywicGFnZXNfaXBuIjoyMTMxLCJwYWdlc19ncmVhdGVycG9sYW5kdXByaXNpbmciOjg2MCwicGFnZXNfcHJ6eXN0YW5la19oaXN0b3JpYSI6MjUwLCJwYWdlc19wb2xza2llX21pZXNpYWNlIjoxNzksInBhZ2VzX2dpZ2FuY2lfbmF1a2kiOjgyLCJwYWdlc19wb3puYW5pcG4iOjM0LCJwYWdlc19iaW9ncmFteSI6MjgsInBhZ2VzX2x1YmxpbmlwbiI6MjgsInBhZ2VzX2tzaWVnYXJuaWFpcG4iOjI0fQ=='
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

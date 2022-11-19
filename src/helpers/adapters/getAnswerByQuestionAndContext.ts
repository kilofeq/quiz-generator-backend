import axios from 'axios'
import axiosRetry from 'axios-retry'
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

async function getAnswerByQuestionAndContext(
  question: string,
  context: string
) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2',
      {
        "inputs": {
          "question": question,
          "context": context
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        },
      }
    )
    return response.data.answer
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }
}

export default getAnswerByQuestionAndContext

import axios from 'axios'
import axiosRetry from 'axios-retry'
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

async function generateQuestion(
  sourceText: string
) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mrm8488/t5-base-finetuned-question-generation-ap',
      {
        "inputs": 'context:' + sourceText,
        "parameters": {
          "num_return_sequences": 3,
          "num_beams": 2,
          "do_sample": true,
          "top_p": 0.95
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        },
      }
    )
    return response.data[0].generated_text.replace('question: ', '')
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }
}

export default generateQuestion

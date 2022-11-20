import axios from 'axios'
import axiosRetry from 'axios-retry'
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

async function translateText(
  sentence: string,
  sourceLanguage: 'pl' | 'en' = 'pl',
) {
  try {
    const url = sourceLanguage === 'pl' ? (
      // Translate from Polish to English
      'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-pl-en'
    ):(
      // Translate from English to Polish
      'https://api-inference.huggingface.co/models/gsarti/opus-mt-tc-en-pl'
    )
    const response = await axios.post(
      url,
      sentence,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        },
      }
    )
    return response.data[0].translation_text
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error)
    } else {
      console.error(error)
    }
  }
}

export default translateText

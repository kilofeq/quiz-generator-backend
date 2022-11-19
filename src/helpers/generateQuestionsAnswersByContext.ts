import translateText from './adapters/translateText'
import generateQuestion from './adapters/generateQuestion'
import getAnswerByQuestionAndContext from './adapters/getAnswerByQuestionAndContext'

export const generateQuestionsAnswersByContext = async (
  context: string
) => {
  const parsedText = context.replace(/(\r\n|\n|\r)/gm, ' ').replace(/(„|”)/g, '"')
  const translatedText = await translateText(parsedText || '', 'pl')
  const question = await generateQuestion(translatedText)
  const answer = await getAnswerByQuestionAndContext(question, translatedText)
  return {
    question: await translateText(question, 'en'),
    answers: [
      {
        text: await translateText(answer, 'en'),
        isCorrect: true
      }
    ]
  }
}

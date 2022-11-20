import translateText from './adapters/translateText'
import generateQuestion from './adapters/generateQuestion'
import getAnswerByQuestionAndContext from './adapters/getAnswerByQuestionAndContext'

export const generateQuestionsAnswersByContext = async (
  context: string
) => {
  // const translatedText = await translateText(context || '', 'pl')
  const question = await generateQuestion(context)
  const answer = await getAnswerByQuestionAndContext(question, context)
  return {
    question: question,
    answers: [
      {
        text: answer,
        isCorrect: true
      }
    ]
  }
}

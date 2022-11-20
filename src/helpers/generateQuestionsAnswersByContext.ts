import translateText from './adapters/translateText'
import generateQuestion from './adapters/generateQuestion'
import getAnswerByQuestionAndContext from './adapters/getAnswerByQuestionAndContext'

export const generateQuestionsAnswersByContext = async (
  context: string
) => {
  const parsedText = context.replace(/(\r\n|\n|\r)/gm, ' ').replace(/(„|”)/g, '"')
  const possibleSlices = Math.floor(parsedText.length / 9000)
  const output = []
  for (let i = 0; i < possibleSlices; i++) {
    const startIndex = i * 9000
    const endIndex = startIndex + 9000
    const slicedText = parsedText.slice(startIndex, endIndex)
    const translatedText = await translateText(slicedText || '', 'pl')
    const question = await generateQuestion(translatedText)
    const answer = await getAnswerByQuestionAndContext(question, translatedText)
    const questionAnswser = {
      question: await translateText(question, 'en'),
      answers: [
        {
          text: await translateText(answer, 'en'),
          isCorrect: true
        }
      ]
    }
    console.log(questionAnswser)
    output.push(questionAnswser)
  }
  return output
}

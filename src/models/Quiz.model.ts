import { model, Schema } from 'mongoose'

const QuizSchema = new Schema({
	userId: {
		type: { type: Schema.Types.ObjectId, ref: 'User' },
		required: [true, 'Please enter a userId'],
	},
	title: {
		type: String,
		required: [true, 'Please enter a title']
	},
	description: {
		type: String,
		required: [true, 'Please enter a description']
	},
	questionsAndAnswers: [{
		question: String,
		answers: [{
			text: String,
			isCorrect: Boolean
		}]
	}]
})

const Quiz = model('Quiz', QuizSchema)

export default Quiz

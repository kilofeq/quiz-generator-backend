import { model, Schema } from 'mongoose'

const UserSchema = new Schema({
	email: {
		type: String,
		required: [true, 'Please enter a unique email address'],
		unique: [true, 'The email is already used']
	},
	password: {
		type: String,
		required: [true, 'Please enter a valid password']
	}
})

const User = model('User', UserSchema)

export default User

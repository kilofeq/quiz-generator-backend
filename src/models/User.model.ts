import { model, Schema } from 'mongoose'

const UserSchema = new Schema({
	email: String,
	password: String
})

const User = model('User', UserSchema)

export default User

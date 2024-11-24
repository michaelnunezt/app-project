const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordConfirmation:  {type: String, required: true },
}, {
  toJSON: { virtuals: true},
  toObject: { virtuals: true }
})

// creating a virtual field
userSchema.virtual('yourDestinations', {
  ref: 'Destination', // Reference to the Trip collection
  localField: '_id', // Local user identifier
  foreignField: 'owner' // The field in the Trip collection 
});


const User = mongoose.model('User', userSchema)

module.exports = User
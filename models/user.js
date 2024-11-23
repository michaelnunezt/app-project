const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  toJSON: { virtuals: true},
  toObject: { virtuals: true }
})

// creating a virtual field
userSchema.virtual('tripsTaken', {
  ref: 'Trip', // Reference to the Trip collection
  localField: '_id', // Local user identifier
  foreignField: 'traveler' // The field in the Trip collection 
});

userSchema.virtual('favoriteCities', {
  ref: 'City', // Reference to the City collection
  localField: '_id', // Local user identifier
  foreignField: 'favoritedBy' // Field in the City collection
});

const User = mongoose.model('User', userSchema)

module.exports = User
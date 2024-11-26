const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordConfirmation:  {type: String, required: true },
  profileImage: String
}, {
  toJSON: { virtuals: true},
  toObject: { virtuals: true }
})

// creating a virtual field
userSchema.virtual('destinationsAttending', {
  ref: 'Destination', // Reference to the Trip collection
  localField: '_id', // Local user identifier
  foreignField: 'attendees' // The field in the Trip collection 
});

userSchema.virtual('destinationsOrganised', {
  ref: 'Event', // The ref is the collection to look for the objects to populate this field with
  localField: '_id', // local identifier, usually _id
  foreignField: 'organiser' // which field are we looking for a matching value to the localField
})

const User = mongoose.model('User', userSchema)

module.exports = User
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true // this option set to true provides a dynamic createdAt and updatedAt field that update automatically
})

const destinationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true }, // Country of the city
  description: { type: String }, // Description of the city
  population: { type: Number }, // Population of the city
  image: { type: String },
  isPopular: Boolean,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})



const Destination = mongoose.model('Destination', destinationSchema)
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Destination, Comment
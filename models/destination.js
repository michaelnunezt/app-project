const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String },
  population: { type: Number },
  date: { type: Date, required: ['Add a date', true] },
  attendees: [{ type: mongoose.Types.ObjectId, ref: 'User'}],
  images: [String], // Allow multiple images
  isPopular: Boolean,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pointsOfInterest: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true }, // e.g., "Landmark", "Museum"
      description: { type: String, required: true },
    },
  ],
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true // this option set to true provides a dynamic createdAt and updatedAt field that update automatically
})


const Destination = mongoose.model('Destination', destinationSchema)
const Comment = mongoose.model('Comment', commentSchema)

module.exports = { Destination, Comment }

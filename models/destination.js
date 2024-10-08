const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true }, // Country of the city
  description: { type: String }, // Description of the city
  population: { type: Number }, // Population of the city
  image: { type: String },
  isPopular: Boolean
})



const Destination = mongoose.model('Destination', destinationSchema)

module.exports = Destination
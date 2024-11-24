const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true }, // Country of the city
  description: { type: String }, // Description of the city
  population: { type: Number }, // Population of the city
  images: [String],
  isPopular: Boolean,
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const likeSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Types.ObjectId, 
      ref: 'User', 
      required: true // Reference to the user who liked 
    },
    destination_id: { 
      type: mongoose.Types.ObjectId, 
      ref: 'Destination', 
      required: true // Reference to the liked destination 
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);


const Destination = mongoose.model('Destination', destinationSchema)
const Likes = mongoose.model('Like', likeSchema)

module.exports = Destination
module.exports = Likes
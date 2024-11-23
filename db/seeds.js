// Imports
const mongoose = require('mongoose')
require('dotenv/config')

// Models
const Destination = require('../models/destination.js')
const User = require('../models/user.js')

// Data
const destinationData = require('./data/destination.js')
const userData = require('./data/users.js')

// Run seeds
const runSeeds = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔒 Database connection established')

    // Clear existing destinationss
    const deletedDestinations = await Destination.deleteMany()
    console.log(`❌ ${deletedDestinations.deletedCount} destinations deleted from the database`)

    // Clear existing users
    const deletedUsers = await User.deleteMany()
    console.log(`❌ ${deletedUsers.deletedCount} users deleted from the database`)

    // Add new users
    const users = await User.create(userData)
    console.log(`👤 ${users.length} users added to the database`)
  
    // Add organiser field to each event using the users array above
    // const eventsWithOrganisers = eventData.map(event => {
    //   event.organiser = users[Math.floor(Math.random() * users.length)]._id
    //   return event
    // })
    
    // Add new events
    // const events = await Event.create(eventsWithOrganisers)
    // console.log(`🌱 ${events.length} event added to the database`)

    // Close connection to the database
    await mongoose.connection.close()
    console.log('👋 Closing connection to MongoDB')
  } catch (error) {
    console.log(error)
  }
}
runSeeds()
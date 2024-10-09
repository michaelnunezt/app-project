const mongoose = require('mongoose')
const express = require('express')

// ! -- Router
const router = express.Router()

// ! -- Model
const Destination = require('../models/destination.js')

// ! Middleware Functions
const isLoggedIn = require('../middleware/is-logged-in.js')


// ! -- Routes
// * Each route is already prepended with `/destinations`

// * Index Route
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find()
    console.log(destinations)
    return res.render('destinations/index.ejs', { destinations })
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// New Page (form page)
router.get('/new', isLoggedIn, (req, res) => {
  res.render('destinations/new.ejs')
})

// * Show Page
router.get('/:destinationId', async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.destinationId)) {
      const destination = await Destination.findById(req.params.destinationId).populate('organiser')
      if (!destination) return next()

      return res.render('destinations/show.ejs', { destination })
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})


// * Create Route
router.post('/', isLoggedIn, async (req, res) => {
  try {
    req.body.organiser = req.session.user._id // Add the organiser ObjectId using the authenticated user's _id (from the session)
    const destination = await Destination.create(req.body)
    return res.redirect('/destinations')
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * Delete Route
router.delete('/:destinationId', async (req, res) => {
  try {
    const destinationToDelete = await Destination.findByIdAndDelete(req.params.destinationId)

    if (destinationToDelete.organiser.equals(req.session.user._id)) {
      const deletedDestination = await Destination.findByIdAndDelete(req.params.eventId)
      return res.redirect('/destinations')
    }
    throw new Error('User is not authorised to perform this action')

  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

router.get('/:destinationId/edit', isLoggedIn, async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.destinationId)) {
      const destination = await Destination.findById(req.params.destinationId)
      if (!destination) return next()

        if (!destination.organiser.equals(req.session.user._id)) {
          return res.redirect(`/destinations/${req.params.destinationId}`)
        }
  
      return res.render('destinations/edit.ejs', { destination })
    }
    next()
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

router.put('/:destinationId', isLoggedIn, async (req, res) => {
  try {
    const updatedDestination = await Destination.findByIdAndUpdate(req.params.eventId, req.body, { new: true })

    if (destinationToUpdate.organiser.equals(req.session.user._id)) {
      const updatedDestination = await Destination.findByIdAndUpdate(req.params.eventId, req.body, { new: true })

    return res.redirect(`/destinations/${req.params.destinationId}`)
    }
    throw new Error('User is not authorised to perform this action')

  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

module.exports = router
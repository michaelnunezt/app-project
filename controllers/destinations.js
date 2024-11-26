const mongoose = require('mongoose')
const express = require('express')
const upload = require('../middleware/file-upload.js')


// ! -- Router
const router = express.Router()

// ! -- Model
const Destination = require('../models/destination.js')

// ! Middleware Functions
const isLoggedIn = require('../middleware/is-logged-in.js')
// const User = require('../models/user.js')
                                    
//--------------------------------------------------------------------------------------------------
// ! -- Routes
// * Each route is already prepended with `/destinations`

// * Index Route
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find()
    // console.log(destinations)
    return res.render('destinations/index.ejs', { destinations })
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * Destinations Page
// router.get('/destinationsId', async (req, res) => {
//   try {
//     const destinations = await Destination.find()
//     console.log(destinations)
//     return res.render('destinations/destinations.ejs', { destinations })
//   } catch (error) {
//     console.log(error)
//     return res.status(500).send('<h1>An error occurred.</h1>')
//   }
// })


// New Page ( Create form Page)
router.get('/new', isLoggedIn, (req, res) => {
  res.render('destinations/new.ejs')
})


// * Show Destinations Page
router.get('/:destinationId', async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.destinationId)) {
      const destination = await Destination.findById(req.params.destinationId).populate('organiser').populate('comments.user')
      console.log(destination)
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
router.post('/', isLoggedIn, upload.array('images'), async (req, res) => {
  try {
    if (req.files) {
      req.body.images = req.files.map(file => file.path)
    }
    req.body.organiser = req.session.user._id // Add the user ObjectId using the authenticated user's _id (from the session)
    const destination = await Destination.create(req.body)
    req.session.message = 'Destination created successfully'
    req.session.save(() => {
      return res.redirect('/destinations')
    })
  } catch (error) {
    console.log(error)
    return res.status(500).render('destinations/new.ejs', {
      errors: error.errors,
      fieldValues: req.body
    })
  }
})


// * Update 

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
    const destinationToUpdate = await Destination.findById(req.params.destinationId)
    
    if (destinationToUpdate.organiser.equals(req.session.user._id)) {
      const updatedDestination = await Destination.findByIdAndUpdate(req.params.destinationId, req.body, { new: true })
      return res.redirect(`/destinations/${req.params.destinationId}`)
    }
    
    throw new Error('User is not authorised to perform this action')
    
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * Delete
router.delete('/:destinationId', async (req, res) => {
  try {
    const destinationToDelete = await Destination.findById(req.params.destinationId)

    if (destinationToDelete.organiser.equals(req.session.user._id)) {
      const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId)
      return res.redirect('/destinations')
    }
    throw new Error('User is not authorised to perform this action')

  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})

// * -- Create Comment
router.post('/:destinationId/comments', async (req, res, next) => {
  try {

    // Add signed in user id to the user field
    req.body.user = req.session.user._id

    // Find the destination that we want to add the comment to
    const destination = await Destination.findById(req.params.destinationId)
    if (!destination) return next() // send 404

    // Push the req.body (new comment) into the comments array
    destination.comments.push(req.body)

    // Save the destination we just added the comment to - this will persist to the database
    await destination.save()

    return res.redirect(`/destinations/${req.params.destinationId}`)
  } catch (error) {
    req.session.message = error.message

    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`)
    })
  }
})

// * -- Delete Comment
router.delete('/:destinationId/comments/:commentId', isLoggedIn, async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.destinationId)
    if (!destination) return next()
    
    // Locate comment to delete
    const commentToDelete = destination.comments.id(req.params.commentId)
    if (!commentToDelete) return next()

    // Ensure user is authorized
    if (!commentToDelete.user.equals(req.session.user._id)) {
      throw new Error('User not authorized to perform this action.')
    }
    
    // Delete comment (this does not make a call to the db)
    commentToDelete.deleteOne()

    // Persist changed to database (this does make a call to the db)
    await destination.save()

    // Redirect back to show page
    return res.redirect(`/destinations/${req.params.destinationId}`)
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred</h1>')
  }
})

// * Add attending status for a user
router.post('/:destinationId/attending', isLoggedIn, async (req, res, next) => {
  try {
    // Find the destination the user wants to attend
    const destination = await Destination.findById(req.params.destinationId)
    // Send 404 if destination not found
    if (!destination) return next()
    
    // Add logged in user's id into the attendees array
    destination.attendees.push(req.session.user._id)

    // Save the destination to persist to the DB
    await destination.save()

    // Redirect back to the show page
    return res.redirect(`/destinations/${req.params.destinationId}`)
  } catch (error) {
    console.log(error)
    req.session.message = 'Failed to update attending status'
    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`)
    })
  }
})

// * Remove attending status for a user
router.delete('/:destinationId/attending', isLoggedIn, async (req, res, next) => {
  try {
    // Find the destination the user wants to remove their attending status
    const destination = await Destination.findById(req.params.destinationId)
    // Send 404 if destination not found
    if (!destination) return next()
    
    // remove logged in user's id from the attendees array
    destination.attendees.pull(req.session.user._id)

    // Save the destination to persist to the DB
    await destination.save()

    // Redirect back to the show page
    return res.redirect(`/destinations/${req.params.destinationId}`)
  } catch (error) {
    console.log(error)
    req.session.message = 'Failed to update attending status'
    req.session.save(() => {
      return res.redirect(`/destination/${req.params.destinationId}`)
    })
  }
})

router.get('/about', (req, res) => {
  try {
    res.render('destinations/about.ejs'); // Correct path to the EJS file
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Failed to load the About page.</h1>');
  }
});



module.exports = router
const mongoose = require('mongoose')
const express = require('express')
const upload = require('../middleware/file-upload.js')


// ! -- Router
const router = express.Router()

// ! -- Model
const Destination = require('../models/destination.js')

// ! Middleware Functions
const isLoggedIn = require('../middleware/is-logged-in.js')

// Example route to render all destinations
// const allDestinations = (req, res) => {
//   const message = req.flash('message'); // Example: Using connect-flash for flash messages
//   res.render('destinations/index', { message }); // Pass the message variable to the EJS template
// };


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

router.get('/destinations', async (req, res) => {
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
      const destination = await Destination.findById(req.params.destinationId).populate('user')
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

// * tour Route
router.get('/:destinationId', async (req, res, next) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.destinationId)) {
      const destination = await Destination.findById(req.params.destinationId).populate('user').populate('comments.user').populate('likes.user')
      console.log(destination)

      if (!destination) return next()

      return res.render('destinations/tour.ejs', { destination })
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
    req.body.user = req.session.user._id // Add the user ObjectId using the authenticated user's _id (from the session)
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

// * Delete Route
router.delete('/:destinationId', async (req, res) => {
  try {
    const destinationToDelete = await Destination.findById(req.params.destinationId)

    if (destinationToDelete.user.equals(req.session.user._id)) {
      const deletedDestination = await Destination.findByIdAndDelete(req.params.destinationId)
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

        if (!destination.user.equals(req.session.user._id)) {
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

    if (destinationToUpdate.user.equals(req.session.user._id)) {
      const updatedDestination = await Destination.findByIdAndUpdate(req.params.destinationId, req.body, { new: true })

    return res.redirect(`/destinations/${req.params.destinationId}`)
    }
    throw new Error('User is not authorised to perform this action')

  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})


// ! Comments Section

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

// ! -- favoriteCities Section

// * Add favoriteCities status
router.post('/:destinationId/favouriteCities', isLoggedIn, async (req, res, next) => {
  try {
    // Find the destination the user wants to mark as favoriteCities
    const destination = await Destination.findById(req.params.destinationId);
    
    // Send 404 if destination not found
    if (!destination) return next();
    
    // Add logged in user's id into the favoriteCities array
    destination.favoriteCities.push(req.session.user._id);

    // Save the destination to persist to the DB
    await destination.save();

    // Redirect back to the show page for the destination
    return res.redirect(`/destinations/${req.params.destinationId}`);
  } catch (error) {
    console.log(error);
    req.session.message = 'Failed to update favoriteCities status';
    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`);
    });
  }
});

// * 
router.delete('/:destinationId/favoriteCities', isLoggedIn, async (req, res, next) => {
  try {
    // Find the destination the user wants to remove their favoriteCities status
    const destination = await Destination.findById(req.params.destinationId);
    
    // Send 404 if destination not found
    if (!destination) return next();
    
    // Remove logged in user's id from the favoriteCities array
    destination.favoriteCities.pull(req.session.user._id);

    // Save the destination to persist to the DB
    await destination.save();

    // Redirect back to the show page for the destination
    return res.redirect(`/destinations/${req.params.destinationId}`);
  } catch (error) {
    console.log(error);
    req.session.message = 'Failed to update favoriteCities status';
    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`);
    });
  }
});

module.exports = router
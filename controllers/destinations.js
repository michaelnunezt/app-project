const mongoose = require('mongoose')
const express = require('express')
// const upload = require('../middleware/file-upload.js')


// ! -- Router
const router = express.Router()

// ! -- Model
const { Destination, Comment  }  = require('../models/destination.js')
console.log('Destination Model:', Destination);

// ! Middleware Functions
const isLoggedIn = require('../middleware/is-logged-in.js')
// const User = require('../models/user.js')
                                    
//--------------------------------------------------------------------------------------------------
// ! -- Routes
// * Each route is already prepended with `/destinations`

// * Index Route work here the user index
router.get('/', async (req, res) => {
  try {
    console.log('Alberto')
    const destinations = await Destination.find()
    console.log(destinations)
    // return res.render('destinations/index.ejs', { destinations })
  } catch (error) {
    console.log(error)
    return res.status(500).send('<h1>An error occurred.</h1>')
  }
})


// New Page ( Create form Page)
router.get('/new', isLoggedIn, (req, res) => {
  res.render('destinations/new.ejs')
})


// * Show Destinations Page
router.get('/:destinationId', async (req, res, next) => {
  try {
    const { destinationId } = req.params;

    // Validate the destination ID
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return next(); // Invalid ID, proceed to 404 handler
    }

    // Fetch the destination and populate the 'user' field
    const destination = await Destination.findById(destinationId).populate('user');

    if (!destination) {
      return next(); // Destination not found
    }

    // Fetch comments for the destination and populate the 'user' for each comment
    const comments = await Comment.find({ destination: destinationId })
      .populate('user', 'username'); // Only populate the 'username' field

    // Render the destination show page
    return res.render('destinations/show.ejs', {
      destination,
      comments,
      user: req.session.user, // Pass the logged-in user from session
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('<h1>An error occurred.</h1>');
  }
});


// * Create Route
router.post('/', isLoggedIn, async (req, res) => {
  try {
    console.log('Session User:', req.session.user)
    if (req.files) {
      req.body.images = req.files.map(file => file.path)
    }
    req.body.user = req.session.user._id // Add the user ObjectId using the authenticated user's _id (from the session)
    const destination = await Destination.create(req.body)
    req.session.message = 'Destination created successfully'
    req.session.save(() => {
      return res.redirect('/')
    })
  } catch (error) {
    console.log(error)
    return res.status(500).render('destinations/new.ejs', {
      errors: error.errors,
      fieldValues: req.body
    })
  }
})


// * Update Route 
// router.get('/:destinationId/edit', isLoggedIn, async (req, res, next) => {
//   try {
//     if (mongoose.Types.ObjectId.isValid(req.params.destinationId)) {
//       const destination = await Destination.findById(req.params.destinationId);
//       if (!destination) return next();

//       // Ensure correct ownership check using destination.user
//       if (!destination.user.equals(req.session.user._id)) {
//         return res.redirect(`/destinations/${req.params.destinationId}`);
//       }

//       return res.render('destinations/edit.ejs', { destination });
//     }
//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send('<h1>An error occurred.</h1>');
//   }
// });

// // * Update Destination
// router.put('/:destinationId', isLoggedIn, async (req, res) => {
//   try {
//     const destinationToUpdate = await Destination.findById(req.params.destinationId);

//     if (!destinationToUpdate) {
//       req.session.message = 'Destination not found';
//       return res.redirect('/destinations');
//     }

//     // Ensure correct ownership check using destination.user
//     if (!destinationToUpdate.user.equals(req.session.user._id)) {
//       req.session.message = 'You are not authorized to update this destination';
//       return res.redirect(`/destinations/${req.params.destinationId}`);
//     }

//     const updatedDestination = await Destination.findByIdAndUpdate(req.params.destinationId, req.body, { new: true });
//     req.session.message = 'Destination updated successfully!';
//     return res.redirect(`/destinations/${updatedDestination._id}`);
//   } catch (error) {
//     console.error('Error updating destination:', error.message);
//     req.session.message = 'An unexpected error occurred.';
//     return res.redirect(`/destinations/${req.params.destinationId}`);
//   }
// });

// // * Delete Comment
// router.delete('/:destinationId/comments/:commentId', isLoggedIn, async (req, res) => {
//   try {
//     const comment = await Comment.findById(req.params.commentId);

//     if (!comment) {
//       req.session.message = 'Comment not found';
//       return res.redirect(`/destinations/${req.params.destinationId}`);
//     }

//     // Ensure correct ownership check using comment.user
//     if (!comment.user.equals(req.session.user._id)) {
//       req.session.message = 'You are not authorized to delete this comment';
//       return res.redirect(`/destinations/${req.params.destinationId}`);
//     }

//     await comment.deleteOne();

//     req.session.message = 'Comment deleted successfully!';
//     return res.redirect(`/destinations/${req.params.destinationId}`);
//   } catch (error) {
//     console.error('Error deleting comment:', error.message);
//     req.session.message = 'An unexpected error occurred.';
//     return res.redirect(`/destinations/${req.params.destinationId}`);
//   }
// });



// * -- Create Comment
router.post('/:destinationId/comments', async (req, res, next) => {
  try {
    // Verifica che l'utente sia loggato
    if (!req.session.user) {
      req.session.message = 'You must be logged in to comment';
      return res.redirect('/log-in');
    }

    // Aggiungi l'ID dell'utente al corpo della richiesta
    req.body.user = req.session.user._id;
    
    // Validazione del testo del commento
    if (!req.body.text || req.body.text.trim() === '') {
      req.session.message = 'Comment text cannot be empty';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }
    if (req.body.text.length > 500) {
      req.session.message = 'Comment text is too long';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }

    // Trova la destinazione
    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) {
      console.warn(`Destination with ID ${req.params.destinationId} not found.`);
      req.session.message = 'Destination not found';
      return next();
    }

    // Crea il commento
    await Comment.create({
      text: req.body.text,
      user: req.body.user,
      destination: destination._id,
    });

    // Redirect alla pagina della destinazione
    req.session.message = 'Comment added successfully!';
    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`);
    });
  } catch (error) {
    console.error('Error creating comment:', error.message);
    req.session.message = 'An unexpected error occurred. Please try again.';
    req.session.save(() => {
      return res.redirect(`/destinations/${req.params.destinationId}`);
    });
  }
});



// * -- Edit Comment
router.put('/:destinationId/comments/:commentId', async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      req.session.message = 'You must be logged in to edit a comment';
      return res.redirect('/log-in');
    }

    // Validate the comment text
    if (!req.body.text || req.body.text.trim() === '') {
      req.session.message = 'Comment text cannot be empty';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }
    if (req.body.text.length > 500) {
      req.session.message = 'Comment text is too long';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }

    // Find the comment
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      req.session.message = 'Comment not found';
      return next();
    }

    // Ensure the logged-in user is the owner of the comment
    if (!comment.user.equals(req.session.user._id)) {
      req.session.message = 'You are not authorized to edit this comment';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }

    // Update the comment
    comment.text = req.body.text;
    await comment.save();

    req.session.message = 'Comment updated successfully!';
    req.session.save(() => {
      res.redirect(`/destinations/${req.params.destinationId}`);
    });
  } catch (error) {
    console.error('Error editing comment:', error.message);
    req.session.message = 'An unexpected error occurred. Please try again.';
    req.session.save(() => {
      res.redirect(`/destinations/${req.params.destinationId}`);
    });
  }
});



// * -- Delete Comment
router.delete('/:destinationId/comments/:commentId', async (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.session.user) {
      req.session.message = 'You must be logged in to delete a comment';
      return res.redirect('/log-in');
    }

    // Find the comment
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      req.session.message = 'Comment not found';
      return next();
    }

    // Ensure the logged-in user is the owner of the comment
    if (!comment.user.equals(req.session.user._id)) {
      req.session.message = 'You are not authorized to delete this comment';
      return res.redirect(`/destinations/${req.params.destinationId}`);
    }

    // Delete the comment
    await comment.deleteOne();

    req.session.message = 'Comment deleted successfully!';
    req.session.save(() => {
      res.redirect(`/destinations/${req.params.destinationId}`);
    });
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    req.session.message = 'An unexpected error occurred. Please try again.';
    req.session.save(() => {
      res.redirect(`/destinations/${req.params.destinationId}`);
    });
  }
});



router.get('/about', (req, res) => {
  try {
    res.render('destinations/about.ejs'); // Correct path to the EJS file
  } catch (error) {
    console.error(error);
    res.status(500).send('<h1>Failed to load the About page.</h1>');
  }
});



module.exports = router
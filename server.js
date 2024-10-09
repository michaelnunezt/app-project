const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv/config')

// document.addEventListener('DOMContentLoaded', () => {
//   const popup = document.getElementById('popup');
//   const openPopupBtn = document.getElementById('openPopup');
//   const closePopupBtn = document.getElementById('closePopup');
  
//   // Open popup when button is clicked
//   openPopupBtn.addEventListener('click', () => {
//       popup.style.display = 'flex';
//   });
  

//    // Close popup when button is clicked
//    closePopupBtn.addEventListener('click', () => {
//     popup.style.display = 'none';
//   });
// })



// ! Middleware Functions
const isSignedIn = require('./middleware/is-logged-in.js')
const passUserToView = require('./middleware/pass-user-to-view.js')


// * -- Routers/Controllers
const destinationsRouter = require('./controllers/destinations.js')
const authRouter = require('./controllers/auth.js')


// ! -- Variables
const app = express()
const port = 3000 || process.env.port

// ! -- Middleware
app.use(methodOverride('_method')) // this line will convert any request with a ?_method query param into the specified HTTP verb
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))
app.use(morgan('dev'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // setting this to false will prevent unnecessary updates to unmodified sessions
  saveUninitialized: true, // will create a session that does not currently exist in our store
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}))

// Ensure this comes after the session middleware above, as that is where req.session is defined in the first place
app.use(passUserToView)

// ! -- Route Handlers


// * Landing Page
app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/tour', isSignedIn, (req, res) => {
  res.send(`Welcome to all Destinations Tour ${req.session.user.username}.`)
})

// * Routers
app.use('/destinations', destinationsRouter)
app.use('/auth', authRouter)

// ! -- 404
app.get('*', (req, res) => {
  return res.status(404).render('404.ejs')
})


// ! -- Server Connections
const startServers = async () => {
  try {
    // Database Connection
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔒 Database connection established')

    // Server Connection
    app.listen(port, () => {
      console.log(`🚀 Server up and running on port ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

startServers()
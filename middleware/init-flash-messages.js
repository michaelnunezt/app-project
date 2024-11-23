const initFlashMessages = (req, res, next) => {
  res.locals.message = req.session.message
  req.session.message = null
  req.session.save(() => {
    next()
  })
}

module.exports = initFlashMessages
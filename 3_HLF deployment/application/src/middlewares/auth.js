const auth = (req, res, next) => {
  if (req.headers['username']) {
    req.username = req.headers['username']
    next()
  } else {
    res.status(500).json({ error: 'username is required' })
  }
}

module.exports = auth
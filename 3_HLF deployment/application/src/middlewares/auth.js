const auth = (req, res, next) => {
  if (req.headers['enrollment-id']) {
    req.username = req.headers['username']
    next()
  } else {
    res.status(500).json({ error: 'enrollment-id is required' })
  }
}

module.exports = auth
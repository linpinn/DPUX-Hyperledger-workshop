const auth = (req, res, next) => {
  if (req.headers['enrollment-id']) {
    req.user = req.headers['enrollment-id']
    next()
  } else {
    res.status(500).json({ error: 'enrollment-id is required' })
  }
}

module.exports = auth
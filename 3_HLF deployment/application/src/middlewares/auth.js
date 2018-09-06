const auth = (req, res, next) => {
  if (req.headers['network-user']) {
    req.networkUser = req.headers['network-user']
    next()
  } else {
    res.status(500).json({ error: 'username is required' })
  }
}

module.exports = auth
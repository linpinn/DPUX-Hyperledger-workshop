const { register } = require('../service')

const createUser = async (req, res) => {
  try {
    const enrollmentID = req.body.enrollmentID
    if (!enrollmentID) {
      res.status(400).json({ error: 'enrollmentID is required' })
    }
    await register({ enrollmentID })
    res.json({ msg: 'success' })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createUser
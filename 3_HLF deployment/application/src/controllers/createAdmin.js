const { enrollAdmin } = require('../service')
const config = require('../config')

const createAdmin = async (req, res) => {
  try {
    await enrollAdmin(config)
    res.json({ msg: 'success' })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createAdmin
const { enrollAdmin } = require('../service')
const Options = require('../util/helper')
const options = new Options()

const createAdmin = async (req, res) => {
  try {
    await enrollAdmin(options.enrollment)
    res.json({ msg: 'success' })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createAdmin
const { registerNetworkUser } = require('../service')
const config = require('../config')

const createNetworkUser = async (req, res) => {
  try {
    await registerNetworkUser(req.body['network-user'])
    res.json({ msg: 'success' })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createNetworkUser
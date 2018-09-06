const { query } = require('../service')

const getAllUsers = async (req, res) => {
  try {
    if (!req.params.username) {
      throw new Error('username is required')
    }
    const options = {
      chaincodeId: 'demo',
      fcn: 'view',
      args: [JSON.stringify({
        name: req.params.username
      })],
      chainId: 'mychannel',
    }
    const result = await query(req.networkUser, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
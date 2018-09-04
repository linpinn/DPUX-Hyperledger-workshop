const { query } = require('../service')
const config = require('../config')

const getAllUsers = async (req, res) => {
  try {
    if (!req.params.username) {
      throw new Error('username is required')
    }
    const options = {
      chaincodeId: 'chaincode',
      fcn: 'view',
      args: [JSON.stringify({
        name: req.params.username
      })],
      chainId: 'mychannel',
    }
    const result = await query(config.enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
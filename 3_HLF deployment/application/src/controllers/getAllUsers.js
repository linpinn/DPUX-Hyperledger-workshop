const { query } = require('../service')
const config = require('../config')

const getAllUsers = async (req, res) => {
  try {
    const enrollmentID = req.username
    const options = {
      chaincodeId: 'chaincode',
      fcn: 'list',
      args: [],
      chainId: 'mychannel',
    }
    const result = await query(config.enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
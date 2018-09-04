const { invoke } = require('../service')
const config = require('../config')

const getAllUsers = async (req, res) => {
  try {
    const targetUsername = req.body.target
    if (!targetUsername) {
      throw new Error('target is required')
    }

    const amount = req.body.amount
    if (!amount) {
      throw new Error('amount is required')
    }

    const options = {
      chaincodeId: 'chaincode',
      fcn: 'transfer',
      args: [JSON.stringify({
        from: req.username,
        to: targetUsername,
        amount
      })],
      chainId: 'mychannel',
    }
    const result = await invoke(config.enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
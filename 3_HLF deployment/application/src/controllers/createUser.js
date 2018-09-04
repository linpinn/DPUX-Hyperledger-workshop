const { invoke } = require('../service')
const config = require('../config')

const createUser = async (req, res) => {
  try {
    const username = req.body.username
    const options = {
      chaincodeId: 'chaincode',
      fcn: 'register',
      args: [JSON.stringify({
        name: username,
        balance: 1000
      })],
      chainId: 'mychannel',
    }
    const result = await invoke(config.enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createUser
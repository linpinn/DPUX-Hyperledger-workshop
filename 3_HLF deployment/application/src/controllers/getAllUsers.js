const { query } = require('../service')

const getAllUsers = async (req, res) => {
  try {
    const options = {
      chaincodeId: 'demo',
      fcn: 'list',
      args: [],
      chainId: 'mychannel',
    }
    const result = await query(req.networkUser, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
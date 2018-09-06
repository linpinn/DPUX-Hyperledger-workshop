const { invoke } = require('../service')

const getAllUsers = async (req, res) => {
  try {
    const toAccount = req.body['to-account']
    if (!toAccount) {
      throw new Error('to-account is required')
    }

    const fromAccount = req.body['from-account']
    if (!fromAccount) {
      throw new Error('from-account is required')
    }

    const amount = req.body.amount
    if (!amount) {
      throw new Error('amount is required')
    }

    const options = {
      chaincodeId: 'demo',
      fcn: 'transfer',
      args: [JSON.stringify({
        from: fromAccount,
        to: toAccount,
        amount
      })],
      chainId: 'mychannel',
    }
    const result = await invoke(req.networkUser, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getAllUsers
const { invoke } = require('../service')

const createCar = async (req, res) => {
  try {
    const enrollmentID = req.user
    const options = {
      chaincodeId: 'fabcar',
      fcn: 'createCar',
      args: ['CAR13', 'dfdfdfdf', 'ddd', 'Red', 'Nick3'],
      chainId: 'mychannel',
    }
    const result = await invoke(enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = createCar
const { query } = require('../service')

const getCars = async (req, res) => {
  try {
    const enrollmentID = req.user
    const queryOptions = {
      chaincodeId: 'fabcar',
      fcn: 'queryAllCars',
      args: ['']
    }
    const result = await query(enrollmentID, queryOptions)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getCars
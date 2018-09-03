const { query } = require('../service')

const getCars = async (req, res) => {
  try {
    const enrollmentID = req.user
    const options = {
      chaincodeId: 'fabcar',
      fcn: 'queryAllCars',
      args: ['']
    }
    const result = await query(enrollmentID, options)
    res.json(result)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = getCars
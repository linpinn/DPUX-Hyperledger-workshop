const enroll = require('./enroll')
const logger = require('../util/logger')
const Options = require('../util/helper')

const defaultOpts = new Options()

// example ==========================
// request: {
//   chaincodeId: 'chaincodetest',
//   fcn: 'query.something',
//   args: []
// }
// ==================================
const query = async request => {
  logger.debug('[query.js] request is', request)
  let response = null

  try {
    const { enrollOpts: enrollment } = defaultOpts
    const options = Object.assign(enrollment, request)
    const { channel } = await enroll(options)

    const queryResponse = await channel.queryByChaincode(options)

    if (queryResponse && queryResponse.length === 1) {
      response = queryResponse

      if (response instanceof Error) {
        logger.error('[query.js] query error:', response.toString())
        throw new Error('query error')
      } else {
        logger.info('[query.js] query success')
        logger.debug('[query.js] query result:', response.toString())
      }
    }
  } catch (error) {
    logger.error('[query.js] query failed:', error.stack)
    throw new Error('query error')
  }

  return response.toString()
}

module.exports = query
const enroll = require('./enroll')
const logger = require('../util/logger')
const Options = require('../util/helper')

const defaultOpts = new Options()
const timeout = 5000

// transaction event
const setUpTxEventHub = (client, channel, txIDAsString) => {
  const { eventUrl: url, tlsOptions: tls } = defaultOpts.enrollment
  const peer = client.newPeer(url, tls)
  const eventHub = channel.newChannelEventHub(peer)

  const txPromise = new Promise((resolve, reject) => {
    const handleTx = setTimeout(() => {
      eventHub.unregisterTxEvent(txIDAsString)
      eventHub.disconnect()
      resolve({ eventStatus: 'TIMEOUT' })
    }, timeout)

    eventHub.registerTxEvent(
      txIDAsString,
      (tx, validationCode) => {
        clearTimeout(handleTx)
        const eventResponse = {
          eventStatus: validationCode,
          txID: txIDAsString
        }

        if (validationCode === 'VALID') {
          logger.info(`[invoke.js] transaction has been commited on peer ${eventHub.getPeerAddr()}`)
          resolve(eventResponse)
        } else {
          logger.error('[invoke.js] validation code is not VALID')
          resolve(eventResponse)
        }
      },
      error => {
        logger.error('[invoke.js] eventhub error:', error.stack)
        reject(new Error('eventhub error'))
      },
      { disconnect: true }
    )
    eventHub.connect()
  })

  return txPromise
}

// example ==========================
// request: {
//   chaincodeId: 'chaincodetest',
//   fcn: 'query.something',
//   args: []
//   chainId: 'mychannel'
//   txId: txId
// }
// ==================================
const invoke = async request => {
  logger.debug('[invoke.js] request is', request)
  try {
    const { enrollOpts: enrollment } = defaultOpts
    const options = Object.assign(enrollment, request)
    const { client, channel } = await enroll(options)
    const txID = client.newTransactionID()

    logger.info(`[invoke.js] assign transaction id ${txID.getTransactionID()}`)
    // assign txId to request object
    request.txId = txID
    // index 0: from endorsing peer, index 1: need to send to orderer
    const [
      proposalResponses,
      originalProposal
    ] = await channel.sendTransactionProposal(request)

    if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
      logger.debug('[invoke.js] success to sent proposal with response status 200')
      const ordererRequest = {
        proposalResponses,
        proposal: originalProposal
      }
      const txIDAsString = txID.getTransactionID()

      // prepare for promise all
      const promises = []
      const sendPromise = channel.sendTransaction(ordererRequest)
      const txPromise = setUpTxEventHub(client, channel, txIDAsString)

      promises.push(sendPromise)
      promises.push(txPromise)

      const results = await Promise.all(promises)

      if (results && results[0] && results[0].status === 'SUCCESS') {
        logger.debug('[invoke.js] invoked success and tx has been sent to orderer')
      } else {
        logger.debug(`[invoke.js] failed to invoke and tx cannot sent to orderer with status ${results[0].status}`)
      }

      if (results && results[1] && results[1].status === 'VALID') {
        logger.debug('[invoke.js] invoked success and tx has been commited to peer')
      } else {
        logger.debug(`[invoke.js] failed to invoke and tx cannot commited to peer with status ${results[1].status}`)
      }

      logger.info('[invoke.js] invoke success')

      return results
    }

    logger.error('[invoke.js] error on send proposal or receive. response is not 200 or null')
    throw new Error('error on send transaction proposal')
  } catch (error) {
    logger.error('[invoke.js] invoking error:', error.stack)
    throw new Error('invoke error')
  }
}

module.exports = invoke
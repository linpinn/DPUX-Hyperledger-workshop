const logger = require('../util/logger')
const Options = require('../util/helper')
const enroll = require('./enroll')

const options = new Options()
let eventHub = null
let blockEvent = null
let timer = null

// setup eventhub and start as listener
const setUpEventHub = () => {
  timer = Date.now()
  if (eventHub.isconnected() && blockEvent) {
    logger.debug('[eventHub.js] unregistered and disconnected')
    eventHub.unregisterBlockEvent(blockEvent)
    // eventHub.disconnect()
  }
  const { eventUrl: url, tlsOptions: tls } = options.enrollment

  eventHub.setPeerAddr(url, tls)
  blockEvent = eventHub.registerBlockEvent(
    block => {
      const blockNo = block.header.number
      const blockByTx = block.data.data

      logger.info(`[eventHub.js] block event received number is ${blockNo}`)
      timer = Date.now()

      for (let i = 0; i < blockByTx.length; i++) {
        const payloadHeader = blockByTx[i].payload.header
        // blockStatus equal to 0 is VALID, other else is FAILED
        const blockStatus = block.metadata.metadata[2][i]
        const channelID = payloadHeader.channel_header.channel_id
        const txID = payloadHeader.channel_header.tx_id
        const payloadData = JSON.parse(blockByTx[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.response.payload)

        logger.debug(`[eventHub.js] block status: ${blockStatus} on channel ${channelID}`)
        logger.debug(`[eventHub.js] transaction ID: ${txID}`)
        logger.debug('[eventHub.js] block event payload:', payloadData)

        const chaincodeEvent = blockByTx[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.events

        if (chaincodeEvent.event_name !== '') {
          const eventName = chaincodeEvent.event_name
          const ccPayload = chaincodeEvent.payload

          logger.debug(`[eventHub.js] chaincode event from ${eventName}`)
          logger.debug('[eventHub.js] chaincode event payload:', ccPayload.toString('utf-8'))
        }
      }
    },
    error => {
      logger.error('[eventHub.js] block event failed:', error.stack)
    }
  )

  // eventHub.connect()
}

const startEventHub = async () => {
  try {
    const { client } = await enroll(options.enrollment)
    const { checkInterval, idleDuration } = options.eventHub

    eventHub = client.newEventHub()
    logger.info('[eventHub.js] eventhub service started ..')
    setUpEventHub()

    setInterval(() => {
      if (!eventHub.isconnected()) {
        logger.info('[eventHub.js] eventhub service restarted ..')
        setUpEventHub()
      } else if (timer < Date.now() - idleDuration) {
        logger.info('[eventHub.js] eventhub service restarted due to timer exceed ..')
        setUpEventHub()
      }
    }, checkInterval)
  } catch (error) {
    logger.error('[eventHub.js] error while start service:', error)
  }
}

module.exports = startEventHub
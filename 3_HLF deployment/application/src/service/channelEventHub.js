const logger = require('../util/logger')
const Options = require('../util/helper')
const enroll = require('./enroll')

const options = new Options()
let eventHub = null
let blockEvent = null
let timer = null
let curBlockNo = null

// store block number as state
const currentBlockNo = async channel => {
  // make condition to check with stored blockNo store
  // might be redis store
  const stateStore = await channel.queryInfo()
  const latestBlockNo = stateStore.height.low

  return latestBlockNo
}

// need more research => https://fabric-sdk-node.github.io/tutorial-channel-events.html
// createEvent => registerEvent, unregixterEvent, disconnect, connect, resetInterval
// get blockEvent and CCEvent => logic refer to eventHub.js
const setupChannelEventHub = () => {
  logger.info(`[channelEventHub.js] current block is ${curBlockNo}`)

  if (blockEvent || eventHub.checkConnection() === 'READY') {
    logger.debug('[channelEventHub.js] unregistered and disconnected')
    eventHub.unregisterBlockEvent(blockEvent)
    eventHub.disconnect()
  }

  blockEvent = eventHub.registerBlockEvent(
    block => {
      const blockNo = block.header.number
      const blockByTx = block.data.data

      // set current blockNo for follow up
      curBlockNo = blockNo

      timer = Date.now()
      logger.debug(`[channelEventHub.js] block event received number is ${blockNo}`)
      for (let i = 0; i < blockByTx.length; i++) {
        const payloadHeader = blockByTx[i].payload.header
        // blockStatus equal to 0 is VALID, other else is FAILED
        const blockStatus = block.metadata.metadata[2][i]
        const channelID = payloadHeader.channel_header.channel_id
        const txID = payloadHeader.channel_header.tx_id
        const payloadData = JSON.parse(blockByTx[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.response.payload)

        logger.debug(`[channelEventHub.js] block status: ${blockStatus} on channel ${channelID}`)
        logger.debug(`[channelEventHub.js] transaction ID: ${txID}`)
        logger.debug('[channelEventHub.js] block event payload:', payloadData)

        const chaincodeEvent = blockByTx[i].payload.data.actions[0].payload.action.proposal_response_payload.extension.events

        if (chaincodeEvent.event_name !== '') {
          const eventName = chaincodeEvent.event_name
          const ccPayload = chaincodeEvent.payload

          logger.debug(`[channelEventHub.js] chaincode event from ${eventName}`)
          logger.debug('[channelEventHub.js] chaincode payload:', ccPayload.toString('utf-8'))
        }
      }
    },
    error => {
      eventHub.unregisterBlockEvent(blockEvent)
      eventHub.disconnect()
      logger.debug('[channelEventHub.js] status:', eventHub.checkConnection(true))
      logger.error('[channelEventHub.js] block event failed:', error.stack)
    },
    {
      startBlock: Number(curBlockNo),
      unregister: true,
      // by default it will disconnect when idle after 45000ms (grpc-keep-alive)
      disconnect: true
    }
  )

  // false - show only filtered block data
  // true - show full block data
  eventHub.connect(true)
}

// setupEvent => enroll, newEventHub, newChannelEventHub
// recoverEvent => isconnected, setInterval, resetInterval
// one listener per channel because listen each channel rely on channel object
const startChannelEventHub = async () => {
  try {
    // in case of multiple channel listener need to create multiple instance
    // use for loop for create instance
    // for ( let i = 0; i < channelList.length; i++) {
    //     may enroll new object
    //     new channel eventhub instance
    //     inside setUpChannelEventHub need to capture only event from that channel
    //     set interval
    // }
    const { client, channel } = await enroll(options.enrollment)
    const { checkInterval, idleDuration } = options.eventHub
    const { eventUrl: url, tlsOptions: tls } = options.enrollment
    const peer = client.newPeer(url, tls)

    // listen channel on peer
    eventHub = channel.newChannelEventHub(peer)
    curBlockNo = await currentBlockNo(channel)

    logger.info('[channelEventHub.js] eventhub service started ..')
    setupChannelEventHub(curBlockNo)

    setInterval(() => {
      if (!eventHub.isconnected()) {
        logger.info('[channelEventHub.js] eventhub service restarted ..')
        curBlockNo = currentBlockNo(channel)
        setupChannelEventHub(curBlockNo)
      } else if (timer < Date.now() - idleDuration) {
        logger.info('[channelEventHub.js] eventhub service restarted due to timer exceed ..')
        curBlockNo = currentBlockNo(channel)
        setupChannelEventHub(curBlockNo)
      }
    }, checkInterval)
  } catch (error) {
    logger.error('[channelEventHub.js] setup error:', error.stack)
  }
}

module.exports = startChannelEventHub
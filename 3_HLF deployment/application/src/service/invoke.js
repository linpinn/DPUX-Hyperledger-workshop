const FabricClient = require('fabric-client')
const path = require('path')
const Options = require('../util/helper')

const options = new Options()
const kvsPath = path.join(__dirname, './../hfc-key-store')
let txId

const validateProposalResponses = (proposalResponses) => {
  return proposalResponses 
    && proposalResponses[0].response 
    && proposalResponses[0].response.status === 200
}

const invoke = async (enrollmentID, invokeOptions) => {
  let response = null

  try {
    const hfc = new FabricClient()
    const config = options.enrollment
    const channel = hfc.newChannel(config.channelName)
    const peer = hfc.newPeer(config.peerUrl, config.tlsOptions)
    const orderer = hfc.newOrderer(config.ordererUrl, config.tlsOptions)

    channel.addPeer(peer)
    channel.addOrderer(orderer)

    const { newDefaultKeyValueStore, newCryptoSuite, newCryptoKeyStore } = FabricClient

    // set key value store - 'hfc-key-store/{networkID}'
    const eCertStore = path.join(__dirname, `./../hfc-key-store/${config.networkID}`)
    const stateStore = await newDefaultKeyValueStore({ path: eCertStore })

    // set store for hfc
    await hfc.setStateStore(stateStore)

    // enrollment certificate store - 'hfc-key-store'
    const cryptoSuite = newCryptoSuite()
    const cryptoStore = newCryptoKeyStore({ path: kvsPath })

    cryptoSuite.setCryptoKeyStore(cryptoStore)

    await hfc.setCryptoSuite(cryptoSuite)

    await hfc.getUserContext(enrollmentID, true)

    txId = hfc.newTransactionID()
    invokeOptions.txId = txId

    const transactionProposalResponse = await channel.sendTransactionProposal(invokeOptions)
    const proposalResponses = transactionProposalResponse[0]
    const proposal = transactionProposalResponse[1]

    if (validateProposalResponses(proposalResponses)) {
      const request = {
        proposalResponses: proposalResponses,
        proposal: proposal
      }

      const promiseParams = []
      const sendPromise = channel.sendTransaction(request)
		  promiseParams.push(sendPromise)

      const txIdString = txId.getTransactionID()
      const eventHub = channel.newChannelEventHub(peer);
      const txPromise = new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
          eventHub.unregisterTxEvent(txIdString)
          eventHub.disconnect()
          resolve({event_status : 'TIMEOUT'})
        }, 3000)
        eventHub.registerTxEvent(txIdString, (tx, code) => {
          clearTimeout(handle)

          if (code !== 'VALID') {
            reject(new Error(`transaction ${tx} is invalid`))
          } else {
            resolve({ txId : txIdString})
          }
        }, (e) => reject(new Error(`eventhub error with message ${e.message}`)),
          {disconnect: true} //disconnect when complete
        )
        eventHub.connect()
      })
      promiseParams.push(txPromise)

      const result = await Promise.all(promiseParams)
      return result[1]
    } else {
      throw new Error('proposalResponses is invalid')
    }
  } catch (e) {
    throw new Error(`[service.${invoke.name}] failed with error: ${e.message}`)
  }
}

module.exports = invoke
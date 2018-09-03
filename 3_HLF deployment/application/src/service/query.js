const FabricClient = require('fabric-client')
const path = require('path')
const config = require('../config')

const query = async (enrollmentID, queryOptions) => {
  let response = null

  try {
    const hfc = new FabricClient()
    const channel = hfc.newChannel(config.channelName)
    const peer = hfc.newPeer(config.peerUrl, config.tlsOptions)
    const orderer = hfc.newOrderer(config.ordererUrl, config.tlsOptions)

    channel.addPeer(peer)
    channel.addOrderer(orderer)

    const { newDefaultKeyValueStore, newCryptoSuite, newCryptoKeyStore } = FabricClient

    const eCertStore = path.join(config.hfcKeyStorePath, config.networkID)
    const stateStore = await newDefaultKeyValueStore({ path: eCertStore })

    // set store for hfc
    await hfc.setStateStore(stateStore)

    const cryptoSuite = newCryptoSuite()
    const cryptoStore = newCryptoKeyStore({ path: config.hfcKeyStorePath })

    cryptoSuite.setCryptoKeyStore(cryptoStore)

    await hfc.setCryptoSuite(cryptoSuite)

    await hfc.getUserContext(enrollmentID, true)

    response = await channel.queryByChaincode(queryOptions)

    return JSON.parse(response.toString())
  } catch (e) {
    throw new Error(`[service.${query.name}] failed with error: ${e.message}`)
  }
}

module.exports = query
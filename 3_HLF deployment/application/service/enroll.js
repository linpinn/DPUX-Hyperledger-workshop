// fabric class
const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const logger = require('../util/logger')

const kvsPath = path.join(__dirname, './../hfc-key-store')
let currentUser = null
let enrollObj = null
let channel = null

const checkUserContext = async (user, hfc, cryptoSuite, config) => {
  const tlsOptions = {
    trustedRoots: [],
    verify: false
  }

  // fabric ca instance
  const hfca = new FabricCAClient(config.caUrl, tlsOptions, config.caName, cryptoSuite)

  if (user && user.isEnrolled()) {
    logger.debug(`[enroll.js] loaded ${config.enrollmentID} success`)
    currentUser = user || null

    return currentUser
  }
  try {
    const enrollment = await hfca.enroll({
      enrollmentID: config.enrollmentID,
      enrollmentSecret: config.enrollmentSecret
    })

    // recreate user when user not found
    const createdUser = await hfc.createUser({
      username: config.enrollmentID,
      mspid: config.mspID,
      cryptoContent: {
        privateKeyPEM: enrollment.key.toBytes(),
        signedCertPEM: enrollment.certificate
      }
    })

    currentUser = createdUser

    return hfc.setUserContext(currentUser)
  } catch (error) {
    logger.error('[enroll.js] failed to enroll or load cert:', error.stack)
    throw new Error('failed to enroll user')
  }
}

// ============== example params ================
// config: {
//   caUrl: 'http://localhost:7054',
//   caName: 'ca.example.com',
//   enrollmentID: 'admin',
//   enrollmentSecret: 'adminpw',
//   mspID: 'Org1MSP'
// }
// ==============================================
const enroll = async config => {
  logger.debug('[enroll.js] config:', config)
  const hfc = new FabricClient()

  const { newDefaultKeyValueStore, newCryptoSuite, newCryptoKeyStore } = FabricClient

  try {
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

    // check is certificate already have in key store or not
    const userContext = await hfc.getUserContext(config.enrollmentID, true)

    enrollObj = await checkUserContext(userContext, hfc, cryptoSuite, config)

    channel = hfc.newChannel(config.channelName)
    const peer = hfc.newPeer(config.peerUrl, config.tlsOptions)
    const orderer = hfc.newOrderer(config.ordererUrl, config.tlsOptions)

    channel.addPeer(peer)
    channel.addOrderer(orderer)

    logger.info(`[enroll.js] enroll user ${config.enrollmentID} complete`)
  } catch (error) {
    logger.error('[enroll.js] failed to enroll:', error.stack)
  }

  return {
    client: hfc,
    channel,
    context: enrollObj
  }
}

module.exports = enroll
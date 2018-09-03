const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const logger = require('../util/logger')
const Options = require('../util/helper')

const options = new Options()
const kvsPath = path.join(__dirname, './../hfc-key-store')
let currentUser = null
let enrollObj = null

// register new user follow request
const registerNewUser = async (hfca, hfc, config, registrar) => {
  logger.debug('[register.js] register config:', config)
  const { newUserID, affiliations } = config

  try {
    const newUser = {
      enrollmentID: newUserID,
      affiliation: affiliations,
      role: ' client'
    }

    logger.debug('[register.js] new user object:', newUser)

    const userSecret = await hfca.register(newUser, registrar)

    logger.debug(`[register.js] register success with secret ${userSecret}`)
    const newEnrollment = {
      enrollmentID: newUserID,
      enrollmentSecret: userSecret
    }

    logger.debug(`[register.js] enroll new user ${newUserID}`)
    const enrollment = await hfca.enroll({
      enrollmentID: newEnrollment.enrollmentID,
      enrollmentSecret: newEnrollment.enrollmentSecret
    })

    // recreate user when user not found
    const createdUser = await hfc.createUser({
      username: newUserID,
      mspid: config.mspID,
      cryptoContent: {
        privateKeyPEM: enrollment.key.toBytes(),
        signedCertPEM: enrollment.certificate
      }
    })

    currentUser = createdUser

    return await hfc.setUserContext(currentUser)
  } catch (error) {
    throw error
  }
}

// check user context
const checkUserContext = async (user, hfc, cryptoSuite, config) => {
  const tlsOptions = {
    trustedRoots: [],
    verify: false
  }

  // fabric ca instance
  const hfca = new FabricCAClient(config.caUrl, tlsOptions, config.caName, cryptoSuite)

  if (user && user.isEnrolled()) {
    logger.debug(`[register.js] loaded ${config.enrollmentID} success`)
    currentUser = user || null

    return registerNewUser(hfca, hfc, config, user)
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

    const registrarObj = await hfc.setUserContext(currentUser)

    return await registerNewUser(hfca, hfc, config, registrarObj)
  } catch (error) {
    logger.error('[register.js] failed to enroll or load cert:', error.stack)
    throw new Error('failed to enroll user')
  }
}

// example ==========================
// request: {
//   enrollmentID: 'testName'
// }
// ==================================
// this function will do register and enroll
const register = async request => {
  let config = options.enrollment

  logger.debug('[register.js] request:', request)
  logger.debug('[register.js] config:', config)

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

    config = Object.assign(config, { newUserID: request.enrollmentID })
    enrollObj = await checkUserContext(userContext, hfc, cryptoSuite, config)

    logger.info(`[register.js] enroll user ${request.enrollmentID} complete`)
  } catch (error) {
    logger.error('[register.js] failed to register:', error.stack)
  }

  return {
    context: enrollObj
  }
}

module.exports = register
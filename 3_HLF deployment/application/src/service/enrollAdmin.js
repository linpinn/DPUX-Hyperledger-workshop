const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const logger = require('../util/logger')

const kvsPath = path.join(__dirname, './../hfc-key-store')
let currentUser = null

const enrollAdmin = async config => {
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
    const user = await hfc.getUserContext(config.enrollmentID, true)

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

      const enrollment = await hfca.enroll({
        enrollmentID: config.enrollmentID,
        enrollmentSecret: config.enrollmentSecret
      })
  
      // recreate user when user not found
      await hfc.createUser({
        username: config.enrollmentID,
        mspid: config.mspID,
        cryptoContent: {
          privateKeyPEM: enrollment.key.toBytes(),
          signedCertPEM: enrollment.certificate
        }
      })

    logger.info(`[enroll.js] enroll user ${config.enrollmentID} complete`)
  } catch (error) {
    throw new Error(`[service.${enrollAdmin.name}] failed with error: ${e.message}`)
  }
}

module.exports = enrollAdmin
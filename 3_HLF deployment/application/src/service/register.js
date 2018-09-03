const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const logger = require('../util/logger')
const Options = require('../util/helper')

const options = new Options()
const kvsPath = path.join(__dirname, './../hfc-key-store')
let currentUser = null
let enrollObj = null

const registerNewUser = async (hfca, hfc, config, registrar, userEnrollmentId) => {
  const { affiliations } = config
  const user = {
    enrollmentID: userEnrollmentId,
    affiliation: affiliations,
    role: 'client'
  }

  const userSecret = await hfca.register(user, registrar)

  const enrollment = await hfca.enroll({
    enrollmentID: user.enrollmentID,
    enrollmentSecret: userSecret
  })

  await hfc.createUser({
    username: user.enrollmentID,
    mspid: config.mspID,
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  })
}

const register = async user => {
  const config = options.enrollment

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
    const admin = await hfc.getUserContext(config.enrollmentID, true)

    const tlsOptions = {
      trustedRoots: [],
      verify: false
    }
  
    // fabric ca instance
    const hfca = new FabricCAClient(config.caUrl, tlsOptions, config.caName, cryptoSuite)
  
    if (admin && admin.isEnrolled()) {
      await registerNewUser(hfca, hfc, config, admin, user.enrollmentID)
    } else {
      throw new Error(`${config.enrollmentID} is not found in the system.`)
    }
  } catch (e) {
    throw new Error(`[service.${register.name}] failed with error: ${e.message}`)
  }
}

module.exports = register
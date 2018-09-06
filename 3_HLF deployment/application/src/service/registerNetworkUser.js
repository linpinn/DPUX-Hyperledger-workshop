const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')
const config = require('../config')

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

const registerNetworkUser = async username => {
  const hfc = new FabricClient()
  const { newDefaultKeyValueStore, newCryptoSuite, newCryptoKeyStore } = FabricClient

  try {
    const eCertStore = path.join(config.hfcKeyStorePath, config.networkID)
    const stateStore = await newDefaultKeyValueStore({ path: eCertStore })

    // set store for hfc
    await hfc.setStateStore(stateStore)

    const cryptoSuite = newCryptoSuite()
    const cryptoStore = newCryptoKeyStore({ path: config.hfcKeyStorePath })

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
      await registerNewUser(hfca, hfc, config, admin, username)
    } else {
      throw new Error(`${config.enrollmentID} is not found in the system.`)
    }
  } catch (e) {
    throw new Error(`[service.${registerNetworkUser.name}] failed with error: ${e.message}`)
  }
}

module.exports = registerNetworkUser
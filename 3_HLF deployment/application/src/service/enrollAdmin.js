const FabricClient = require('fabric-client')
const FabricCAClient = require('fabric-ca-client')
const path = require('path')

const enrollAdmin = async config => {
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
    const user = await hfc.getUserContext(config.enrollmentID, true)
  
    if (user && user.isEnrolled()) {
      return user
    }

    // fabric ca instance
    const hfca = new FabricCAClient(config.caUrl, null, config.caName, cryptoSuite)

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
  } catch (error) {
    throw new Error(`[service.${enrollAdmin.name}] failed with error: ${e.message}`)
  }
}

module.exports = enrollAdmin
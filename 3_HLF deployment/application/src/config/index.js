const path = require('path')

// read the blockchainConfig file
const configFile = process.env.CONFIGFILE || 'connection-profile-local'
const configPath = `./${configFile}`
const blockchainConfig = require(configPath)

const kvsPath = path.join(__dirname, './../../hfc-key-store')

// get blockchainConfig from file when env does not provided
// https://github.com/IBM-Blockchain/marbles/blob/master/blockchainConfig/connection_profile_cs.json

// connection profile destructure
// organization => add when adminPrivate and signedCert
const { name, client, channels, orderers, peers, certificateAuthorities } = blockchainConfig
const { organization } = client

// get first index only
const [channelName] = Object.keys(channels)
const [chaincodeName] = Object.keys(channels[channelName].chaincodes)
const [ordererName] = Object.keys(orderers)
const [peerName] = Object.keys(peers)
const [caKey] = Object.keys(certificateAuthorities)

// when need to select name need to design more
const { url: ordererUrl } = orderers[ordererName]
const { url: peerUrl, eventUrl } = peers[peerName]
const { url: caUrl, registrar, tlsCACerts, caName } = certificateAuthorities[caKey]
const [registrarObj] = registrar

// first registrar
const { enrollId, enrollSecret, 'x-affiliations': affiliations } = registrarObj

// tls certificate if needed
let tlsCaCert = null

if (tlsCACerts && tlsCACerts.pem) {
  tlsCaCert = tlsCACerts.pem
}

const config = {
  port: process.env.PORT || '3003',
  hfcKeyStorePath: kvsPath,
  caUrl: process.env.CAURL || caUrl,
  caName: process.env.CANAME || caName,
  enrollmentID: process.env.ADMINNAME || enrollId,
  enrollmentSecret: process.env.ADMINSECRET || enrollSecret,
  affiliations: process.env.AFFILIATION || affiliations[0],
  mspID: process.env.MSPID || organization,
  networkID: process.env.NETWORKID || name,
  channelName: process.env.CHANNELNAME || channelName,
  chaincodeName: process.env.CHAINCODENAME || chaincodeName,
  peerUrl: process.env.PEERURL || peerUrl,
  eventUrl: process.env.EVENTURL || eventUrl,
  ordererUrl: process.env.ORDERERURL || ordererUrl,
  tlsCaCert: process.env.TLSCACERT || tlsCaCert,
}

module.exports = config
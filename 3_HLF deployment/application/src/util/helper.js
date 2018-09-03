require('dotenv').config({ path: './.env' })

// read the config file
const configFile = process.env.CONFIGFILE || 'connection-profile-local'
const configPath = `../config/${configFile}`
const config = require(configPath)

// get config from file when env does not provided
// https://github.com/IBM-Blockchain/marbles/blob/master/config/connection_profile_cs.json

// connection profile destructure
// organization => add when adminPrivate and signedCert
const { name, client, channels, orderers, peers, certificateAuthorities } = config
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

class Options {
  constructor () {
    // ca
    this.caUrl = process.env.CAURL || caUrl
    this.caName = process.env.CANAME || caName
    this.enrollmentID = process.env.ADMINNAME || enrollId
    this.enrollmentSecret = process.env.ADMINSECRET || enrollSecret
    // hardcoded first affiliation only
    this.affiliations = process.env.AFFILIATION || affiliations[0]

    // organization
    this.mspID = process.env.MSPID || organization

    // network
    this.networkID = process.env.NETWORKID || name

    // api config
    this.checkInterval = Number(process.env.CHECKINTERVAL) || Number(15000)
    this.idleDuration = Number(process.env.IDLEDURATION) || Number(5 * 60 * 1000)

    // channel
    this.channelName = process.env.CHANNELNAME || channelName
    this.chaincodeName = process.env.CHAINCODENAME || chaincodeName

    // peer
    this.peerUrl = process.env.PEERURL || peerUrl
    this.eventUrl = process.env.EVENTURL || eventUrl

    // orderer
    this.ordererUrl = process.env.ORDERERURL || ordererUrl

    // tls certificate => for ssl connection such grpcs://, https://
    this.tlsCaCert = process.env.TLSCACERT || tlsCaCert
  }

  get enrollment () {
    const opt = {
      caUrl: this.caUrl,
      caName: this.caName,
      enrollmentID: this.enrollmentID,
      enrollmentSecret: this.enrollmentSecret,
      affiliations: this.affiliations,
      mspID: this.mspID,
      networkID: this.networkID,
      tlsOptions: this.makeTlsOptions(),
      channelName: this.channelName,
      peerUrl: this.peerUrl,
      ordererUrl: this.ordererUrl,
      eventUrl: this.eventUrl
    }

    return opt
  }

  get eventHub () {
    const opt = {
      checkInterval: this.checkInterval,
      idleDuration: this.idleDuration
    }

    return opt
  }

  setEnrollmentID (_enrollmentID) {
    this.enrollmentID = _enrollmentID
  }

  setEnrollmentSecret (_enrollmentSecret) {
    this.enrollmentSecret = _enrollmentSecret
  }

  makeTlsOptions () {
    const pem = this.tlsCaCert || null
    const opt = {
      'ssl-target-name-override': null,
      pem
    }

    return opt
  }
}

module.exports = Options
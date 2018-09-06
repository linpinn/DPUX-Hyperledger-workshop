const express = require('express')
const router = express.Router()
const {
  healthCheck,
  createAdmin,
  createUser,
  getAllUsers,
  getOneUser,
  transfer,
  createNetworkUser
} = require('../controllers')
const { auth } = require('../middlewares')

// routes w/o auth
router.get('/health-check', healthCheck)
router.post('/admin', createAdmin)
router.post('/network-users', createNetworkUser)

// routes with auth
router.get('/users/:username', auth, getOneUser)
router.get('/users', auth, getAllUsers)
router.post('/transfer', auth, transfer)
router.post('/users', auth, createUser)


module.exports = router
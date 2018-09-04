const express = require('express')
const router = express.Router()
const {
  healthCheck,
  createAdmin,
  createUser,
  getAllUsers,
  getOneUser,
  transfer
} = require('../controllers')
const { auth } = require('../middlewares')

// routes w/o auth
router.get('/health-check', healthCheck)
router.post('/admin', createAdmin)
router.post('/users', createUser)
router.get('/users/:username', getOneUser)

// routes with auth
router.get('/users', auth, getAllUsers)
router.post('/transfer', auth, transfer)


module.exports = router
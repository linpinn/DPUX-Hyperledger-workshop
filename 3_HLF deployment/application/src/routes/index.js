const express = require('express')
const router = express.Router()
const {
  healthCheck,
  createAdmin,
  createUser,
  getAllCars,
  createCar,
  getAllUsers,
  getOneUser
} = require('../controllers')
const { auth } = require('../middlewares')

// routes w/o auth
router.get('/health-check', healthCheck)
router.post('/admin', createAdmin)
router.post('/users', createUser)
router.get('/users/:username', getOneUser)

// routes with auth
router.get('/cars', auth, getAllCars)
router.get('/users', auth, getAllUsers)
router.post('/cars', auth, createCar)


module.exports = router
const express = require('express')
const router = express.Router()
const {
  healthCheck,
  createAdmin,
  createUser,
  getAllCars,
  createCar
} = require('../controllers')
const { auth } = require('../middlewares')

// routes w/o auth
router.get('/health-check', healthCheck)
router.post('/admin', createAdmin)
router.post('/user', createUser)

// routes with auth
router.get('/cars', auth, getAllCars)
router.post('/cars', auth, createCar)

module.exports = router
const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const { auth } = require('../middlewares')

// routes w/o auth
router.get('/health-check', controllers.healthCheck)
router.post('/admin', controllers.createAdmin)
router.post('/user', controllers.createUser)

// routes with auth
router.get('/cars', auth, controllers.getAllCars)
router.post('/cars', auth, controllers.createCar)

module.exports = router
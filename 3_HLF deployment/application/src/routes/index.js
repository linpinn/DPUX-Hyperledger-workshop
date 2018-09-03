const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

router.get('/health-check', controllers.healthCheck)
router.post('/admin', controllers.createAdmin)
router.post('/user', controllers.createUser)

module.exports = router;
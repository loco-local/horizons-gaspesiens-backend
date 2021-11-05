const express = require('express')
const router = express.Router()
const MembershipController = require('../controller/MembershipController')

router.post(
    '/membership',
    MembershipController.get
)

module.exports = router

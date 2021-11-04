const express = require('express')
const router = express.Router()
const MembershipController = require('../controller/MembershipController')

router.get(
    '/membership',
    MembershipController.get
)

module.exports = router

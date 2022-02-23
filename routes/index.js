const express = require('express')
const router = express.Router()
const MembershipController = require('../controller/MembershipController')

router.post(
    '/membership',
    MembershipController.get
)

router.get(
    '/membership/send_reminder',
    MembershipController.sendReminders
)

// router.get(
//     '/membership/test_email',
//     MembershipController.testSendgrid
// )

// router.get(
//     '/membership/test_set_redis',
//     MembershipController.testSetRedis
// )
//
// router.get(
//     '/membership/test_get_redis',
//     MembershipController.testGetRedis
// )

module.exports = router

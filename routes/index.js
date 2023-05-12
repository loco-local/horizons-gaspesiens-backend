const express = require('express')
const router = express.Router()
const MembershipController = require('../controller/MembershipController')
const EventController = require('../controller/EventController')

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

router.get(
    '/events',
    EventController.list
)
router.get(
    '/events/colors',
    EventController.listColors
)

module.exports = router

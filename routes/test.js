const express = require('express')
const router = express.Router()

router.post('/test', (req , res) => {
    res.send('11123213121')
    res.end
})

module.exports = router
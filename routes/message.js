var express = require('express');
var router = express.Router();
const authCheck = require('../middleware/authCheck')

const messageController = require('../controller/messageController')

// 撈訊息容器
router.post('/getMessageContainer', authCheck.authCheck , messageController.getMessageContainer)

module.exports = router;
var express = require('express');
var router = express.Router();
const authCheck = require('../middleware/authCheck')

const messageContainerController = require('../controller/messageContainerController')



// 撈訊息容器
router.post('/getMessageContainer', authCheck.authCheck , messageContainerController.getMessageContainer)

// 取得房間名稱
router.post('/getRoomName', authCheck.authCheck , messageContainerController.getRoomName)



module.exports = router;
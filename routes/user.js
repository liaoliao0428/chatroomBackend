var express = require('express');
var router = express.Router();
const authCheck = require('../middleware/authCheck')

const userController = require('../controller/userContorller')


// 登入
router.post('/signin', userController.signin)
// 建立帳號
router.post('/signup', userController.signup)
// 取得使用者資料
router.post('/getUserData', authCheck.authCheck , userController.getUserData)
// 加入好友
router.post('/addFriend', authCheck.authCheck , userController.addFriend)

module.exports = router;
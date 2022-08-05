var express = require('express');
var app = express();
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// 取得post參數套件
var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json 
app.use(bodyParser.json())

// 自定義的db modules
var { db } = require('../../modules/connectdb')

// 宣告使用者物件
var user = {
    '_id': null,
    'userName': null,
    'account': null,
    'password': null
}

router.post('/', async function(req, res) {
    // const result = await db.find('user')
    result = '1111'
    res.json(result)
    res.end()
});

// 登入
router.post('/signin', async function(req, res) {
    
    account = req.body.account
    password = req.body.password

    // 查詢條件
    condition = {
        'account': account
    }

    // 判斷密碼是否正確
    const userData = await db.findOne('user' , condition)
    // 如果userData為空代表無此帳號 回傳false
    if ( !userData ) {
        res.send(false)
    }else{
        const correctPassword = userData.password
        // request輸入的密碼跟正確的密碼比對
        const passwordCompareResult = await bcrypt.compare(password, correctPassword)
        res.send(passwordCompareResult)
    }   
    
    res.end()
});

// 建立帳號
router.post('/signup', async function(req, res) {

    user._id = uuidv4()
    user.userName = req.body.userName
    user.account = req.body.account
    user.password = bcrypt.hashSync(req.body.password, 10)

    // 查詢條件
    condition = {
        account: user.account
    }

    // 查詢帳號是否重複
    const findCountResult = await db.findCount('user' , condition)
    // 大於0代表重複
    if (findCountResult > 0) {
        res.send(false)
    }else{
        const insertOneResult = await db.insertOne('user' , user)
        res.send(insertOneResult.acknowledged)
    }

    res.end()
});

module.exports = router;
var express = require('express');
var app = express();
var router = express.Router();

// 第三方套件
// jwt套件
var jwt = require('jsonwebtoken');
// jwt key
const jwtKey = '123456789'
// 取得post參數套件
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// base64
const { Base64 } = require('js-base64');

// 自定義的db modules
var { db } = require('../../modules/connectdb')

const authMiddleWare = async (req, res, next) => {
    const { authorization } = req.headers

    if ( !authorization ) return  res.send({ errmsg: 'token已過期' })
    // 解析token
    const { account } = jwt.verify(authorization, jwtKey)
    // res.send(account)

    if ( account ) {
        req.account = account
        next()
    } else {
        res.send({
            errmsg: 'token已過期'
        })
    }
}

// 取得使用者資料
router.post('/getUserData', authMiddleWare , async function(req, res) {

    // 查詢條件
    condition = {
        'account': req.account
    }

    // 查詢欄位
    column = {
        'userName': 1,
        'account': 1,
        'roomId': 1
    }

    // 查詢使用者資訊
    const findOneResult = await db.findOne('user' , condition , column)
    
    res.send(findOneResult)
    res.end()
});

// 加入好友
router.post('/addFriend', authMiddleWare , async function(req, res) {

    const account = req.account
    const friendId = req.body.friendId

    // 查詢條件
    condition = {
        'account': friendId
    }

    // 查詢輸入的好友id是否正確
    const findCountResult = await db.findCount('user' , condition)
    if (findCountResult == 1 && account !== friendId) {
        // 先看是否已加入好友
        // 是否已加入好友檢查條件
        const checkaddFreindCondition = {
            'account': account ,
            'friendId': {$elemMatch:{$in:[friendId]}}
        }

        const checkRoomIdCount = await db.findCount('user' , checkaddFreindCondition)
        if (checkRoomIdCount == 0) {
            // 加入好友id
            addFriendId(account , friendId)

            res.send({
                'addFriend': true
            })

        }else{
            res.send({
                'addFriend': false,
                'addFriendResponse': '已加入好友'
            })
        }
    }else{
        res.send({
            'addFriend': false,
            'addFriendResponse': '好友id輸入錯誤'
        })
    }

    res.end()
});

// 加入好友id
const addFriendId = async (account , friendId) => {
    // 用base64編碼建立房號id
    const roomIdObject = {
        'id1': account,
        'id2': friendId,
    }
    const roomId = Base64.encode(JSON.stringify(roomIdObject))        

    // update or insert
    const options = {
        'upsert': true ,
    }        

    // 自己的帳號friendId寫入朋友id , roomId寫入共同roomId
    await db.updateOne('user' , {
        'account': account 
    } , {
        $addToSet:{
            friendId: friendId,
            roomId: roomId
        }
    } , options )

    // 朋友的帳號friendId寫入自己id , roomId寫入共同roomId
    await db.updateOne('user' , {
        'account': friendId 
    } , {
        $addToSet:{
            friendId: account,
            roomId: roomId
        }
    } , options )

    // 訊息表寫入roomId以及訊息容器
    addRoomIdToMessage(roomId)
}

// 宣告訊息容器
class messageContainer {
    roomId;
    message = [];
}

// 訊息表寫入roomId
const addRoomIdToMessage = async ( roomId ) => {
    const newMessageContainer = new messageContainer()
    newMessageContainer.roomId = roomId
    await db.insertOne('message' , newMessageContainer)
}


module.exports = router;
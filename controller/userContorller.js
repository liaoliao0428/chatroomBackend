// 自定義的db modules
var { db } = require('../modules/connectdb')
// contorller
const messageController = require('./messageController')
const messageContainerController = require('./messageContainerController')

// 第三方套件
// 獨立id
const { v4: uuidv4 } = require('uuid');
// 加密
const bcrypt = require('bcrypt');
// jwt套件
const jwt = require('jsonwebtoken');
// jwt key
const jwtKey = '123456789'
const { Base64 } = require('js-base64');

// 宣告使用者物件
class user {
    _id;
    userName;
    account;
    password;
    friendId = [];
    roomId = [];
}

const userController = {
    // 登入
    signin: async (req , res) => {
        try {    
                   
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
                res.send({
                    'login': false ,
                })
            }else{
                // request輸入的密碼跟正確的密碼比對
                const correctPassword = userData.password
                const passwordCompareResult = await bcrypt.compare(password, correctPassword)

                if (passwordCompareResult) {
                    // 生成accessToken
                    const token = jwt.sign({
                        account: account,
                    }, jwtKey)

                    res.send({
                        'login': true ,
                        'accessToken': token
                    })
                }else{
                    res.send({
                        'login': false ,
                    })
                }
            }  
            
            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)      

        } catch (err) {
            console.log('錯誤' , err);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        }
    },

    // 建立帳號
    signup: async (req , res) => {
        try {
        
            // 查詢條件
            condition = {
                'account': req.account
            }

            // 查詢帳號是否重複
            const findCountResult = await db.findCount('user' , condition)
            // 大於0代表重複
            if (findCountResult > 0) {
                res.send(false)
            }else{

                const newUser = new user()
                newUser._id = uuidv4()
                newUser.userName = req.body.userName
                newUser.account = req.body.account
                newUser.password = bcrypt.hashSync(req.body.password, 10)

                const insertOneResult = await db.insertOne('user' , newUser)
                res.send(insertOneResult.acknowledged)
            }

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)

        } catch (error) {
            console.log('signup' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        }
    },

    // 取得使用者資料
    getUserData: async (req , res) => {
        try {

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

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
            
            res.send(findOneResult)

        } catch (error) {
            console.log('getUserData' , error);   

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        }
    },

    // 加入好友
    addFriend: async (req , res) => {

        try {
            
            const account = req.account
            const userName = req.body.userName
            const friendId = req.body.friendId

            // 查詢條件
            condition = {
                'account': friendId
            }

            // 查詢輸入的好友id是否正確
            const findResult = await db.find('user' , condition)
            if (findResult.length == 1 && account !== friendId) {
                // 先看是否已加入好友
                // 是否已加入好友檢查條件
                const checkaddFreindCondition = {
                    'account': account ,
                    'friendId': {$elemMatch:{$in:[friendId]}}
                }

                const checkRoomIdCount = await db.findCount('user' , checkaddFreindCondition)
                if (checkRoomIdCount == 0) {
                    // 加入好友id
                    await userController.addFriendId(account , userName , friendId , findResult[0])

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

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)

        } catch (error) {
            console.log('addFriend' , error); 

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        }
    },

    // 加入好友id
    addFriendId: async (account , userName , friendId , findResult) => {

        try {
            // 用base64編碼建立房號id
            const userIdArray = [account , friendId]
            const roomIdObject = {
                userIdArray
            }
            const roomId = Base64.encode(JSON.stringify(roomIdObject) , true)        

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
            await messageController.addRoomIdToMessage(roomId)

            // 訊息容器內寫入
            await messageContainerController.addMessageContainer(account , roomId , findResult.userName)
            await messageContainerController.addMessageContainer(friendId , roomId , userName)

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        } catch (error) {
            console.log('addFriendId' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
        }
    }
}

module.exports = userController
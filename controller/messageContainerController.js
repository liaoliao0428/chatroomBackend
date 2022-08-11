// 自定義的db modules
var { db } = require('../modules/connectdb')

// contorller
const messageController = require('./messageController')

// 宣告訊息容器
class room {
    roomId;
    roomName;
    unRead = '0';
    message;
    updateTime;
}

// 第三方套件
// 獨立id
const { v4: uuidv4 } = require('uuid');

const messageContainerController = {
    // 訊息表寫入roomId
    addMessageContainer: async (account , roomId , name) => {

        const newRoom = new room();
        
        newRoom.roomId = roomId
        newRoom.roomName = name

        // update or insert
        const options = {
            'upsert': true ,
        }        

        await db.updateOne('messageContainer' , {
            account: account 
        } , {
            $addToSet:{
                room: newRoom
            }
        } , options )
    },

    // 取得訊息容器
    getMessageContainer: async (req , res) => {

        const account = req.account

        const condition = {
            'account': account
        }

        const column = {
            room: 1
        }

        const findOneResult = await db.findOne('messageContainer' , condition , column)

        res.send(findOneResult)
        res.end()
    },

    // 取得房間名稱
    getRoomNameMessage: async (req , res) => {
        const account = req.account
        const roomId = req.body.roomId

        // 取得房間名稱條件
        const condition = {
            account: account
        }

        const column = {
            room:{
                roomId: 1,
                roomName: 1
            }
        }

        const rooms = await db.findOne('messageContainer', condition , column)

        const roomNameIndex = rooms.room.map((item) => {
            return item.roomId;
        }).indexOf(roomId);
        // 取得房間名稱

        const messageHistory = await messageController.getMessageHistory(req.body.roomId)

        const roomData = {
            account: account,
            roomName: rooms.room[roomNameIndex].roomName,
            messageHistory: messageHistory.message
        }

        res.send(roomData)
        res.end()
    },
}

module.exports = messageContainerController
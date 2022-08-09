// 自定義的db modules
var { db } = require('../modules/connectdb')

// 訊息容器class
class messageContainer {
    roomId;
    message = [];
}

// 訊息class
class messageData {
    from;
    message;
    time;
}

const messageController = {
    // 訊息表寫入roomId
    addRoomIdToMessage: async ( roomId ) => {
        const newMessageContainer = new messageContainer()
        newMessageContainer.roomId = roomId
        await db.insertOne('message' , newMessageContainer)
    },

    getMessageContainer: async (req , res) => {
        const account = req.account
    },

    // 撈訊息紀錄
    getMessageHistory: async ( roomId ) => {
        // 取得房間名稱條件
        const condition = {
            roomId: roomId
        }

        // 欄位
        const column = {
            message: 1
        }

        const messageHistory = await db.findOne('message' , condition , column)
        
        return messageHistory
    },

    // 訊息寫入訊息容器
    insertMessage: async (roomId , from , message , time) => {

        const newMessage = new messageData()
        newMessage.from = from
        newMessage.message = message
        newMessage.time = time

        // update or insert
        const options = {
            'upsert': true ,
        }        

        await db.updateOne('message' , {
            roomId: roomId 
        } , {
            $addToSet:{
                message: newMessage
            }
        } , options )
    }
}

module.exports = messageController
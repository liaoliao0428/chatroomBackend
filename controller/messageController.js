// 自定義的db modules
var { db } = require('../modules/connectdb')

// 宣告訊息容器
class messageContainer {
    roomId;
    message = [];
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
    }
}

module.exports = messageController
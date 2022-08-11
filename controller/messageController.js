// 第三方套件
// 獨立id
const { v4: uuidv4, v4 } = require('uuid');

// 自定義的db modules
var { db } = require('../modules/connectdb')

// 訊息容器class
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

    // getMessageContainer: async (req , res) => {
    //     const account = req.account
    // },

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
    insertMessage: async (roomId , newMessage) => {

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
    },

    // 將訊息已讀狀態更新至已讀
    updateMessageStatus: async ( readCheckData ) => {

        // update or insert
        const options = {
            'upsert': false ,
        }

        await db.updateOne('message' , {
            'roomId': readCheckData.roomId,
            'message.id': readCheckData.checkId
        } , {
            $set:{
                'message.$.status': true
            }
        } , options)
    },

    // 把所有未讀的訊息改為以讀
    // updateAllMessageStatus: async ( initReadCheckData ) => {
        
    //     // update or insert 
    //     const options = {
    //         'upsert': false ,
    //     }
    // }
}

module.exports = messageController
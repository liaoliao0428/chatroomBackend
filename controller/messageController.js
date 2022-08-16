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

        try {
            
            const newMessageContainer = new messageContainer()
            newMessageContainer.roomId = roomId
            await db.insertOne('message' , newMessageContainer)

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 

        } catch (error) {
            console.log('addRoomIdToMessage' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 
        }
    },

    // 撈訊息紀錄
    getMessageHistory: async ( roomId ) => {

        try {
        
            // 取得房間名稱條件
            const condition = {
                roomId: roomId
            }

            // 欄位
            const column = {
                message: 1
            }

            const messageHistory = await db.findOne('message' , condition , column)

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)
            
            return messageHistory

        } catch (error) {
            console.log('getMessageHistory' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 
        }
    },

    // 訊息寫入訊息容器
    insertMessage: async (roomId , newMessage) => {

        try {
            // update or insert
            const options = {
                'upsert': true ,
            }        

            // 更新訊息集合
            await db.updateOne('message' , {
                roomId: roomId 
            } , {
                $addToSet:{
                    message: newMessage
                }
            } , options )

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100)

        }catch (error) {
            console.log('insertMessage' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 
        }
    },

    // 將訊息已讀狀態更新至已讀
    updateMessageStatus: async ( readCheckData ) => {

        try {

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

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 

        } catch (error) {
            console.log('updateMessageStatus' , error);

            // 關閉資料庫連線
            setTimeout(() => {
                db.close()
            } , 100) 
        }
    },
}

module.exports = messageController
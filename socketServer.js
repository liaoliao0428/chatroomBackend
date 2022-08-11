const { db } = require('./modules/connectdb')
const format = require('date-format');
const messageController = require('./controller/messageController')

// 獨立id
const { v4: uuidv4 } = require('uuid');

// 訊息class
class message {
    id;
    from;
    message;
    status;
    time;
}

module.exports = (io) => {
//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
    io.on('connection', async socket => {

        //經過連線後在 console 中印出訊息
        console.log(socket.handshake.query.account + '/' + socket.id + '/' + 'success connect!')

        // 查詢當前帳號的房間id 並加入
        const account = socket.handshake.query.account
        // 查詢條件
        condition = {
            'account': account
        }

        // 欄位
        column = {
            'roomId': 1
        }

        // 連線成功加入房間
        const roomIds = await db.findOne('user', condition , column)
        roomIds.roomId.forEach((item) => {
            socket.join(item)
        })

        // 監聽傳送訊息事件
        socket.on('sendMessage' , messageData => {
            const newMessage = new message()
            newMessage.id = uuidv4()
            newMessage.from = messageData.account
            newMessage.message = messageData.message
            newMessage.status = false
            newMessage.time = format.asString('yyyy-MM-dd hh:mm' , new Date())

            const messageResponse = {
                'roomId': messageData.roomId,
                'messageData': newMessage           
            }

            // 訊息儲存至message表
            messageController.insertMessage(messageData.roomId , newMessage)

            // 傳送的訊息
            io.sockets.in(messageData.roomId).emit('sendMessageResponse', messageResponse)

            // 詢問是否已讀
            readCheckData = {
                'roomId': messageData.roomId,
                'checkId': newMessage.id
            }
            
            socket.to(messageData.roomId).emit('readCheck' , readCheckData)
        })

        // 已讀確認
        socket.on('readCheckYes' , readCheckData => {
            // 資料庫資料改成已讀
            messageController.updateMessageStatus(readCheckData)

            socket.to(readCheckData.roomId).emit('readCheckYes' , readCheckData)
        })

        //監聽透過 connection 傳進來的事件
        socket.on('getMessage', message => {
            //回傳 message 給發送訊息的 Client
            socket.emit('getMessage' , message)
        })

        // 取得聊天室訊息紀錄事件
        socket.on('getMessageHistory' , roomId => {
            console.log(roomId);
        })        

        //送出中斷申請時先觸發此事件
        socket.on('disConnection' , message => {
            //再送訊息讓 Client 做 .close()
            socket.emit('disConnection', '')
        })

        // 剛點進來的已讀確認
        socket.on('initReadCheck' , initReadCheckData => {
            // 把所有未讀的訊息改為以讀
            socket.to(initReadCheckData.roomId).emit('initReadCheck' , initReadCheckData.roomId)
        })

        // 把所有的訊息都標示已讀
        socket.on('updateAllReadCheck' , updateAllReadCheckData => {
            updateAllReadCheckData.unReadIds.forEach((item) => {
                console.log(item);

                const readCheckData = {
                    roomId: updateAllReadCheckData.roomId,
                    checkId: item.id
                }

                // 資料庫資料改成已讀
                setTimeout(() => {
                    messageController.updateMessageStatus(readCheckData)
                } , 300)
            })
        })
    })
}
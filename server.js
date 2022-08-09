const { db } = require('./modules/connectdb')
const format = require('date-format');
const messageController = require('./controller/messageController')

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
            const time = format.asString('yyyy-MM-dd hh:mm' , new Date())
            const messageResponse = {
                'from': messageData.account,
                'message': messageData.message,
                'time': time
            }

            // 訊息儲存至message表
            messageController.insertMessage(messageData.roomId , messageData.account , messageData.message , time)

            io.sockets.in(messageData.roomId).emit('sendMessageResponse', messageResponse)
        })

        //監聽透過 connection 傳進來的事件
        socket.on('getMessage', message => {
            //回傳 message 給發送訊息的 Client
            socket.emit('getMessage', message)
        })

        // 取得聊天室訊息紀錄事件
        socket.on('getMessageHistory' , roomId => {
            console.log(roomId);
        })        

        //送出中斷申請時先觸發此事件
        socket.on('disConnection', message => {
            //再送訊息讓 Client 做 .close()
            socket.emit('disConnection', '')
        })
    })
}
// 第三方套件
// jwt套件
var jwt = require('jsonwebtoken');
// jwt key
const jwtKey = '123456789'

module.exports = {
    authCheck: async (req, res, next) => {
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
}
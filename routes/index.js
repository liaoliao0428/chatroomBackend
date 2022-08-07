module.exports = (app) => {
  app.use('/test', require('./test'))

  app.use('/chatRoom/api/message', require('./message'))
  app.use('/chatRoom/api/user', require('./user'))
  app.use('/chatRoom/api/messageContainer', require('./messageContainer'))

}

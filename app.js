const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
// 取得post參數套件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// route
require('./routes')(app)

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// socket 連線
const server = require('http').createServer(app)
const io = require('socket.io')(server , {
  cors: true
})

require('./socketServer')(io)

server.listen(3002, () => 
  console.log(`Example app listening on port 3002!`)
)
// socket 連線

module.exports = app;

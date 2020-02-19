//  modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

// Routers 
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishesRouter');
const promoRouter = require('./routes/promotionRouter');
const leaderRouter = require('./routes/leaderRouter');


// Models
const Dishes = require('./models/dishes');


// database url
const url = 'mongodb://localhost:27017/conFusion';

// Database configuration
const connect = mongoose.connect(url);
connect
.then((db)=>{
  console.log('Connected to the server');
})
.catch((err)=>{
  console.log('Error: \n',err);
})


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req, res, next){
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    if(!authHeader){
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401;
      next(err);
    } else {
      const auth = new Buffer(authHeader.split(' ')[1],'base64').toString().split(':');
      const usernamme = auth[0];
      const password = auth[1];
      if(usernamme === 'admin' && password === 'password'){
        next();
      } else{
        const err = new Error('You are not authenticated');
        res.setHeader('WWW-Authenticate','Basic');
        err.status = 401;
        next(err);
      }
    }
}

app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

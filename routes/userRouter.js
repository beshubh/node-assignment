const express = require('express');
const userRouter = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/users');

userRouter.use(bodyParser.json());
userRouter.get('/',(req, res)=>{
  res.send('respond with a source');
});

userRouter.post('/signup',(req,res,next)=>{
  User.findOne({username:req.body.username})
  .then((user)=>{
    if(user != null){
      const err = new Error(`user with username ${req.body.username}  already exists`);
      err.status = 403;
      next(err);
    } else {
      return User.create({
        username:req.body.username,
        password:req.body.password
      });
    }
  })
  .then((user)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({status:'Registration successful',user:user});
  })
  .catch((err)=>{
    next(err);
  })
});

userRouter.post('/login',(req, res, next)=>{
  if(!req.session.user) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401;
      next(err);
    } else {
      const auth = new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
      const username = auth[0];
      const password = auth[1];
      User.findOne({username:username})
      .then((user)=>{
        if(!user) {
          const err = new Error(`user ${username} does not exists`);
          err.status = 403;
          next(err);
        } else if(user.password != password) {
            const err = new Error(`Your password is incorrect`);
            err.status = 403;
            next(err);
        }
         else if(username === user.username && password === user.password){
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type','text/plain');
          res.end('Your are authenticated');
        }
      })
      .catch((err)=>{
        next(err);
      });
    }
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    res.end('You are already authenticated');
  }
});

userRouter.get('/logout',(req,res)=>{
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.setHeader('Content-Type','text/plain');
    res.end('You are logged out');
  } else {
    const error = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
})

module.exports = userRouter;

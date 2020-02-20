const express = require('express');
const bodyParser = require('body-parser');
const promotionRouter = express.Router();
const Promotions = require('../models/promotions');
const {verifyUser, verifyAdmin} = require('../authenticate');
promotionRouter.route('/')
.get((req,res, next)=>{
    Promotions.find({})
    .then((promotions)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions);
    })
    .catch((err)=>{
        next(err);
    });
})
.post(verifyUser,verifyAdmin,(req,res, next)=> {
    Promotions.create(req.body)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch((err)=>{
        next(err);
    });
})
.put(verifyUser,verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete(verifyUser,verifyAdmin,(req,res,next)=>{
    Promotions.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    });
});

promotionRouter.route('/:promotionId')
.get((req,res,next)=>{
    Promotions.findById(req.params.promotionId)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch((err)=>{
        next(err);
    });
})
.post(verifyUser,verifyAdmin,(req,res,next)=>{
    res.statusCode = 403;
    res.end('Post operation not supported');
})
.put(verifyUser,verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.promotionId,{
        $set:req.body
    },{new:true})
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    })
    .catch((err)=>{
        next(err);
    });
})
.delete(verifyUser,verifyAdmin,(req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promotionId)
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    });
});
module.exports = promotionRouter;
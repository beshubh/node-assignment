const express = require('express');
const bodyParser = require('body-parser');
const promotionRouter = express.Router();

promotionRouter.route('/').
all( (req, res,next)=>{
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    next();
})
.get((req,res, next)=>{
    res.end('Will send all the promotions to you');
})
.post((req,res, next)=> {
    res.end('Will add the dish: '+req.body.name+' with details: '+req.body.description);
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete((req,res,next)=>{
    res.statusCode=403;
    res.end("Deleting all the promotions");
});
promotionRouter.route('/:promotionId').
get((req,res)=>{
    res.end(`Promotion : ${req.params.promotionId}`);
}).
post((req,res)=>{
    res.end('Post operation not supported');
}).
put((req,res)=>{
    res.end(`Will update promotion ${req.params.promotionId}`);
})
.delete((req,res)=>{
    res.end(`Deleting promotion ${req.params.promotionId}`);
});

module.exports = promotionRouter;
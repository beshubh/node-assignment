const express = require('express');
const bodyParse = require('body-parser');

const dishRouter = express.Router();
dishRouter.use(bodyParse.json());
dishRouter.route('/').
all( (req, res,next)=>{
    res.statusCode = 200;
    res.setHeader('Content-type','text/plain');
    next();
})
.get((req,res, next)=>{
    res.end('Will send all the dishes to you');
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
    res.end("Deleting all the dishes");
});
dishRouter.route('/:dishId').
get((req,res)=>{
    res.end(`Dish : ${req.params.dishId}`);
}).
post((req,res)=>{
    res.end('Post operation not supported');
}).
put((req,res)=>{
    res.end(`Will update ${req.params.dishId}`);
})
.delete((req,res)=>{
    res.end(`Deleting post ${req.params.dishId}`);
});
module.exports = dishRouter;

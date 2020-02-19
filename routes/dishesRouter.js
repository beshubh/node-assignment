const express = require('express');
const bodyParse = require('body-parser');
const mongoose = require('mongoose');
const {verifyUser}  = require('../authenticate');
const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParse.json());
dishRouter.route('/')
.get((req,res, next)=>{
    Dishes.find({})
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    })
    .catch((err)=>{
        next(err);
    })
})
.post(verifyUser,(req,res, next)=> {
    Dishes.create(req.body)
    .then((dish)=>{
        console.log("Dish Created: ",dish);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
})
.put(verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on dishes");
})
.delete(verifyUser,(req,res,next)=>{
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    })
});
dishRouter.route('/:dishId').
get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
}).
post((req,res,next)=>{
    res.end('Post operation not supported');
}).
put(verifyUser,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new:true})
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
})
.delete(verifyUser,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    })
});
module.exports = dishRouter;

dishRouter.route('/:dishId/comments')
.get((req,res, next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null) {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    })
})
.post(verifyUser,(req,res, next)=> {
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null) {
            dish.comments.push(req.body);
            dish.save()
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=>next(err));
            
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
})
.put(verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end("Put operation not supported on for all the comments");
})
.delete(verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null) {
            const n = dish.comments.length;
            for(let i = 0; i < n; i++) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=> next(err));
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    })
});
dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        } else if (dish === null){
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
})
.post(verifyUser,(req,res,next)=>{
    res.end('Post operation not supported for particular comment');
})
.put(verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
            if(req.body.rating) {
                const newRating = req.body.rating;
                dish.comments.id(req.params.commentId).rating = newRating;

            }
            if(req.body.comment) {
                const newComment = req.body.comment;
                dish.comments.id(req.params.commentId).comment = newComment;
            }
            dish.save()
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=>next(err));
        } else if (dish ===null){
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
})
.delete(verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=>next(err));
        } else if (dish ===null){
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = 404;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
});
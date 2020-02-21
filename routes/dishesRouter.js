const express = require('express');
const bodyParse = require('body-parser');
const mongoose = require('mongoose');
const {verifyUser,verifyAdmin}  = require('../authenticate');
const Dishes = require('../models/dishes');
const {statusCode,applicationJson, contentType} = require('./utils');
const dishRouter = express.Router();
const cors = require('./cors');
dishRouter.use(bodyParse.json());
dishRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res, next)=>{
    Dishes.find({})
    .populate('comments.author')
    .then((dishes)=>{
        res.statusCode=statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    })
    .catch((err)=>{
        next(err);
    })
})
.post(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res, next)=> {
    Dishes.create(req.body)
    .then((dish)=>{
        console.log("Dish Created: ",dish);
        res.statusCode=statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
})
.put(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res,next)=>{
    res.statusCode=statusCode.forbidden;
    res.end("Put operation not supported on dishes");
})
.delete(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res,next)=>{
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode=statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    })
});

dishRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode=statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
})
.post(cors.corsWithOptions, (req,res,next)=>{
    res.end('Post operation not supported');
})
.put(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new:true})
    .then((dish)=>{
        res.statusCode = statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    })
    .catch((err)=>{
        next(err);
    })
})
.delete(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode=statusCode.ok;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    })
});
module.exports = dishRouter;

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, verifyUser,(req,res, next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish != null) {
            res.statusCode=statusCode.ok;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    })
})
.post(cors.corsWithOptions, verifyUser,(req,res, next)=> {
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish)=>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=>{
                    res.statusCode = statusCode.ok;
                    res.setHeader(contentType, applicationJson);
                    res.json(dish);
                })
                .catch(err=> next(err));
            },(err)=>next(err));
            
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
})
.put(cors.corsWithOptions, verifyUser,(req,res,next)=>{
    res.statusCode=statusCode.forbidden;
    res.end("Put operation not supported for all the comments");
})
.delete(cors.corsWithOptions, verifyUser,verifyAdmin,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null) {
            const n = dish.comments.length;
            for(let i = 0; i < n; i++) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish)=>{
                Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=>{
                    res.statusCode = statusCode.ok;
                    res.setHeader(contentType, applicationJson);
                    res.json(dish);
                })
                .catch(err=> next(err));
            },(err)=> next(err));
        } else {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    })
});

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish !== null && dish.comments.id(req.params.commentId) !== null) {
            res.statusCode=statusCode.ok;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        } else if (dish === null){
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = statusCode.notFound;
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
.put(cors.corsWithOptions, verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        const comment  = dish.comments.id(req.params.commentId);
        if(dish !== null && comment !== null) {
            const commentAuthorId = comment.author;

            if(commentAuthorId.equals(req.user._id)) {  

            if(req.body.rating) {
                const newRating = req.body.rating;
                dish.comments.id(req.params.commentId).rating = newRating;
            }
            if(req.body.comment) {
                const newComment = req.body.comment;
                dish.comments.id(req.params.commentId).comment = newComment;
            }
            dish.save()
            .then((dish) => {
                res.statusCode = statusCode.ok;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
                },
                (err) => next(err) );
            } else{
                const err = new Error(`You don't have permission to do this operation`);
                err.status = statusCode.forbidden;
                next(err); 
            }
        } else if (dish ===null) {
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
})
.delete(cors.corsWithOptions, verifyUser,(req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        const comment = dish.comments.id(req.params.commentId);
        if(dish !== null && comment !== null) {
            const commentAuthorId = comment.author;

            if(commentAuthorId.equals(req.user._id)) {  
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((dish)=>{
                    res.statusCode=statusCode.ok;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);
                },
                (err)=>next(err));
            } else {
                const err = new Error(`You don't have permission to do this operation`);
                err.status = statusCode.forbidden;
                next(err); 
            }
        } else if (dish ===null){
            const err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        } else{
            const err = new Error(`comment ${req.params.commentId} does not exist`);
            err.status = statusCode.notFound;
            next(err);
        }
    })
    .catch((err)=>{
        next(err);
    });
});
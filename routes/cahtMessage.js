const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');

const db = require("../db/db");
const checkJwt = require("./../middleware/checkAuth");

router.get('/:receiverId', checkJwt, (req, res, next) => {
    db.chatSchema.find({
        $or: [
            
               { $and: [ 
                    {to: mongoose.Types.ObjectId(req.decoded.user._id.toString())},
                    {from:  mongoose.Types.ObjectId(req.params.receiverId.toString())}
                ]},{
                $and: [
                    {to: mongoose.Types.ObjectId(req.params.receiverId.toString())},
                    {from:  mongoose.Types.ObjectId(req.decoded.user._id.toString())}
                ]}
            
        ]
    }).exec((err, messages) => {
       // console.log('chatMessge', messages)
        res.json(messages)
    })
})


module.exports = router;
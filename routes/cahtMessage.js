const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');

const db = require("../db/db");
const checkJwt = require("./../middleware/checkAuth");

module.exports = function (io, onlineUsers) {
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
    
    router.post('/delete-msg', checkJwt, (req, res, next) => {
        let userId = req.decoded.user._id
        let msgId = req.body.id
        let receiverID = req.body.receiverID;
        // console.log('msgid": ', msgId)
    
        db.chatSchema.findOne({ _id: msgId })
            .exec((err, msg) => {
                  console.log('msdd',msg)
                if (msg) {
                    if (msg.delete.length == 0) {
                        console.log('length: ', msg)
                        db.chatSchema
                        .updateOne({ _id: msgId}, { $push: { delete: userId } })
                        .exec((err, res1) => {
                            if(res1) {
                                const receiverSocketId = onlineUsers.get(receiverID.toString());
                                if (receiverSocketId) {
                                    console.log('here socket',)
                                    io.to(receiverSocketId).emit('message_deleted_request', {
                                        messageId: msgId,
                                        action: 'delete_request',
                                        deletedBy: userId,
                                        timestamp: new Date()
                                    });
                                }
                                res.json(
                                    {
                                        success: true,
                                        message: 'message delete request'
                                    }
                                )
                            }
                        })
                    } else {
                     if(msg.delete[0] == userId) {
                        console.log('restore msg')
                        db.chatSchema
                        .updateOne({ _id: msgId}, { $pull: { delete: userId } })
                        .exec((err, res2) => {
                            if(res2) {
                                const receiverSocketId = onlineUsers.get(receiverID.toString());
                                if (receiverSocketId) {
                                    console.log('here socket',)
                                    io.to(receiverSocketId).emit('message_restore', {
                                        messageId: msgId,
                                        deletedBy: userId,
                                    });
                                }
                                res.json(
                                    {
                                        success: true,
                                        message: 'message restore'
                                    }
                                )
                            }
                        })
                     } else {
                        db.chatSchema.findOneAndRemove({ _id: msgId }).exec((err, res3) => {
                            if(res3) {
                                const receiverSocketId = onlineUsers.get(receiverID.toString());
                                if (receiverSocketId) {
                                    console.log('here socket',)
                                    io.to(receiverSocketId).emit('message_delete_permenant', {
                                        messageId: msgId,
                                        deletedBy: userId,
                                    });
                                }
                                console.log('delete successfully')
                                res.json(
                                    {
                                        success: true,
                                        message: 'message confirm delete'
                                    }
                                )
                            }
                        })
                     }
                    }
                    
                }
                })
    
    })
    return router; 
}




const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const checkjwt = require('../middleware/checkAuth');
const db = require('../db/db');

router.post('/', checkjwt, async (req) => {
    const userId = req.decoded.user._id
    const publicKey = req.body.publicKey;

    const user = await db.userSchema.findOne({_id: userId},).exec();
    if (user['publicKey'] == null) {
        db.userSchema.findOne({_id: userId}, (err, user) => {
            user.publicKey = publicKey;
            user.save();
        });
    } else {
    const query = {_id: userId};
    db.userSchema.findOneAndUpdate(query, 
        {
            publicKey: publicKey
        });
    }
});

router.post('/get-receiver-public-key', checkjwt, (req, res) => {
    const senderId = req.decoded.user._id;
    const receiverId = req.body.id;
    if (receiverId && senderId) {
        db.userSchema.findOne({_id: receiverId}, (err, user) => {
            if (err) throw err;
            if (user) {
                res.json(user.publicKey);
            }
        });
    }
});

module.exports = router;
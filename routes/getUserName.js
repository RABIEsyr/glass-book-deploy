const express = require('express');
const router = express.Router();
const checkJwt = require('./../middleware/checkAuth');
const ObjectId = require('mongoose').Types.ObjectId;
const db =require('../db/db');

router.post('/', checkJwt, (req, res, next) => {
    console.log('getUserNmae', req.body.to)
    db.userSchema.findOne({_id: req.body.to})
    .exec((err, user) => {
        res.send(user)
    })
})

module.exports = router
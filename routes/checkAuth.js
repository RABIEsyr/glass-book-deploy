const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const config = require('../config/config');

router.get('', (req, res) => {
    const token = req.headers["authorization"];
    if (token) {
        jwt.verify(token, config.secret, function(err) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'not authenticted'
                });
            } else {
                res.json({
                    success: true,
                    msg: 'authenticated'
                })
            }
        })
    } else {
        res.json({
            success: false,
            msg: 'not token provided'
        });
    }
})

module.exports = router;
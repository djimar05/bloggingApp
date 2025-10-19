const limiter = require('express-rate-limit');

const rateLimter = limiter({
    windowMs: 60 * 60 * 1000,
    max: 100, 
    message: 'Too many requests from this IP, please try again after 60 minutes'
});

module.exports.rateLimter = rateLimter;
'use strict';

const router = require('express').Router();

router.use('/post', require('./post'));
router.use('/auth', require('./auth'));
router.use('/profile', require('./profile'));
router.use('/', require('./homepage'));

module.exports = router;
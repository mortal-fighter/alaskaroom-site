'use strict';

const router = require('express').Router();

router.use('/post', require('./post'));
router.use('/', require('./homepage'));

module.exports = router;
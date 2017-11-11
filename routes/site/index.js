'use strict';

const router = require('express').Router();
const logger = require('log4js').getLogger();

router.get('/', require('./landing'));

module.exports = router;
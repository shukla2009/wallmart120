'use strict';

var express = require('express');
var controller = require('./pos.controller');

var router = express.Router();

router.get('/', controller.generate);

module.exports = router;
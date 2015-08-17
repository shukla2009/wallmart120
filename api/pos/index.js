'use strict';

var express = require('express');
var controller = require('./pos.controller');

var router = express.Router();

router.get('/pos', controller.indexPOS);
router.get('/poslog', controller.generate);
router.get('/categories', controller.indexCat);
router.get('/products', controller.indexProduct);
router.get('/inventories', controller.indexInv);
router.get('/purchaseorders', controller.indexPO);
router.get('/start', controller.start);


module.exports = router;
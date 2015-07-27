'use strict';

var express = require('express');
var controller = require('./pos.controller');

var router = express.Router();

router.get('/pos', controller.generate);
router.get('/categories', controller.indexCat);
router.get('/products', controller.indexProduct);
router.get('/inventories', controller.indexInv);
router.get('/purchaseorders', controller.indexPO);


module.exports = router;
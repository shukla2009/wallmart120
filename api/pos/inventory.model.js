'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InvSchema = new Schema({upc: String, quantity: Number, storeId: Number, prob: Number}, {strict: false});
module.exports = mongoose.model('inventories', InvSchema);

'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var POSSchema = new Schema({order:String}, {strict: false});
module.exports = mongoose.model('pos', POSSchema);

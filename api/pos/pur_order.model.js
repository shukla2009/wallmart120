'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var POSchema = new Schema({upc:{type:String,required: true}}, { strict: false });
module.exports = mongoose.model('pur_order', POSchema);

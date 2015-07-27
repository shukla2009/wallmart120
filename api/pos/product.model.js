'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ProductSchema = new Schema({upc:{type:String,required: true,unique:true}}, { strict: false });
module.exports = mongoose.model('products', ProductSchema);

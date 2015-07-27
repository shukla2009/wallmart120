'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CatSchema = new Schema({}, {strict: false});
module.exports = mongoose.model('categories', CatSchema);

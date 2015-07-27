'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;




//var ProductSchema = new Schema({
//  itemId: Number,
//  parentItemId: Number,
//  name: String,
//  salePrice: Number,
//  upc: String,
//  categoryPath: String,
//  shortDescription: String,
//  longDescription: String,
//  brandName: String,
//  thumbnailImage: String,
//  mediumImage: String,
//  largeImage: String,
//  ninetySevenCentShipping: Boolean,
//  standardShipRate: Number,
//  twoThreeDayShippingRate: Number,
//  overnightShippingRate: Number,
//  color: String,
//  marketplace: Boolean,
//  shipToStore: Boolean,
//  freeShipToStore: Boolean,
//  productUrl: String,
//  bestMarketplacePrice: {
//    price: Number,
//    sellerInfo: String,
//    standardShipRate: Number,
//    availableOnline: Boolean,
//    clearance: Boolean
//  },
//  categoryNode: String,
//  bundle: Boolean,
//  clearance: Boolean,
//  preOrder: Boolean,
//  stock: String,
//  freeShippingOver50Dollars: Boolean,
//  maxItemsInOrder: Number,
//  availableOnline: Boolean
//},{_id:false});
var ThingSchema = new Schema({upc:{type:String,required: true,unique:true}}, { strict: false });
module.exports = mongoose.model('things', ThingSchema);

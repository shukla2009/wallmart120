/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var Thing = require('./thing.model');



exports.index = function (req, res) {

  Thing.find().exec(function (err, things) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, things);
  });
};



// Creates a new thing in the DB.
exports.create = function (req, res) {
  Thing.create(req.body, function (err, thing) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(201, thing);
  });
};


function handleError(res, err) {
  return res.send(500, err);
}

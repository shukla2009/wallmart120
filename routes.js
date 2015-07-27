/**
 * Main application routes
 */

'use strict';


module.exports = function(app) {

  // Insert routes below
  app.use('/api/pos', require('./api/pos'));
  app.use('/api/thing', require('./api/thing'));


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(function(req,res){
        res.send(404,"Not a valid url")
      });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.send({pos:"/api/pos",productBySku:"/api/product/<sku>"});
    });
};

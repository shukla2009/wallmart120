/**
 * Main application routes
 */

'use strict';


module.exports = function (app) {

    // Insert routes below
    app.use('/api', require('./api/pos'));


    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(function (req, res) {
            res.send(404, "Not a valid url")
        });

    // All other routes should redirect to the index.html
    app.route('/*')
        .get(function (req, res) {
            res.write('POS Live Stream  => /api/pos (date|sku|upc|cat|brand|store|quantity|price|total|TrasactionType(1=> purchase , 0=> return)) \n');
            res.write("Products => api/products(JSON) \n");
            res.write("Categories => api/categories(JSON) \n");
            res.write("Inventories => api/inventories(JSON) \n");
            res.write("Purchase Orders => api/purchaseorders(JSON)\n");
            res.end();
        });
};

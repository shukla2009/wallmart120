var methodOverride = require('method-override');
module.exports = function (app) {


    app.use(methodOverride());
}
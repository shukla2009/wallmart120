var INV = require('./inventory.model');
var PROD = require('./product.model');
var PUR_ORDER = require('./pur_order.model');
var startDate = 1356978600000;
exports.generate = function (req, response) {
    var tempDate = 1356978600000;
    req.socket.CurrentIntId = setInterval(function () {
        var prob1 = Math.floor(Math.random() * 1000);
        var prob2 = Math.floor(Math.random() * 100);
        var prob3 = Math.random();

        var query = INV.find({prob: prob1});
        query.exec(function (err, invs) {
            invs.forEach(function (i) {
                PROD.findOne({upc: i.upc}).lean().exec(function (err, res) {
                    var p = res;
                    tempDate = tempDate + Math.floor(Math.random() * 60 * 10000) + 1000;
                    var date = tempDate;
                    //check for not producing future record
                    while (date > Date.now()) {

                    }
                    var sku = p.itemId;
                    var upc = i.upc;
                    var cat = p.categoryPath;
                    var brand = p.brandName;
                    var store = i.storeId;
                    var price = p.salePrice;
                    var quan = Math.floor(Math.random() * 100) + 1;
                    var total = quan * price;
                    var tType = 1;
                    var isValid = false;
                    if (prob3 > 0.9) {
                        isValid = true;
                        tType = 0;
                    }
                    else if (i.quantity >= quan) {
                        isValid = true;
                    } else {
                        var order = {};
                        order.upc = i.upc;
                        order.storeId = i.storeId;
                        order.quantity = Number(p.upc.substr(p.upc.length - 4));
                        order.status = 'pending';
                        order.orderedAt = date;
                        var prob5 = Math.floor(Math.random() * 10 * 60 * 1000);
                        PUR_ORDER.create(order, function (err, po) {
                            if (err) {
                                console.error(err);
                            }
                            setTimeout(function () {
                                PUR_ORDER.update({_id: po._id}, {$set: {status: 'received', receivedAt: date + prob5}});
                                INV.update({
                                    upc: po.upc,
                                    storeId: po.storeId
                                }, {$inc: {quantity: po.quantity}}).exec();
                            }, prob5)
                        });
                    }
                    if (isValid) {
                        var str = date + "|" + sku + "|" + upc + "|" + cat + "|" + brand + "|" + store + "|" + quan + "|" + price + "|" + total + "|" + tType;
                        if (!tType) {
                            quan = -quan;
                        }
                        INV.update({_id: i._id}, {$inc: {quantity: -quan}}).exec();
                        response.write(str + "\n")
                    }
                });
            });
        });
    }, 10);
}
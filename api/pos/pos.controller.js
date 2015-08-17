var INV = require('./inventory.model');
var CUR_INV = require('./cur_inventory.model');
var PROD = require('./product.model');
var PUR_ORDER = require('./pur_order.model');
var CAT = require('./category.model');
var POS = require('./pos.model');
var CronJob = require('cron').CronJob;
var kafka = require('kafka-node');
var config = require('../../config/conf');
var Producer = kafka.Producer;
var client = new kafka.Client(config.kafka.connectionString, config.kafka.clientId);
var producer = new Producer(client);
producer.on('ready', function () {
    producer.createTopics(['POS', 'PURCHASE_ORDER'], false, function (err, data) {
        console.log(data);
    });
    console.log('producer is ready...');
});
producer.on('error', function (err) {
    console.log('err at produer' + err);

})
var timeZone = 'Asia/Kolkata';//'America/Los_Angeles';

var inventories = {};
var listeners = [];
var purchaseOrders = {};
var purchaseOrdersinTransit = {};
var purchaseOrdersPending = {};
var started = false;
new CronJob('00 00 22 * * *', function () {
    console.log('Sync inventory every day after store closing');
    for (var k in inventories) {
        if (inventories.hasOwnProperty(k)) {
            var i = inventories[k];
        }
        CUR_INV.update({upc: i.upc}, i, function (err, inv) {
            if (err) {
                console.error(err);
            }
        });
    }
}, null, true, timeZone);

new CronJob('00 */11 * * * *', function () {
    console.log('Pick Purchase Order and process it ');
    var keys = Object.keys(purchaseOrders);
    var date = generateNextOrderDate();
    var totalLoopTimings = Math.floor(Math.random() * 20) + 1;
    for (var j = 0; j <= totalLoopTimings; j++) {
        var index = Math.floor(Math.random() * keys.length) + 1;
        var po = purchaseOrders[keys[index]];
        if (!!po) {
            po.orderedAt = date;
            po.status = "pending";
            po.quantity = Number(po.upc.substr(po.upc.length - 4));
            po.receivedBy = po.orderedAt + Math.floor(Math.random() * 100) * 24 * 60 * 60 * Math.floor(Math.random() * 1000);
            purchaseOrdersPending[keys[index]] = po;
            delete purchaseOrders[keys[index]];
            createPO(po);
        }
    }
}, null, true, timeZone);

new CronJob('00 */13 * * * *', function () {
    console.log('Pick Purchase Order and keep in transit');
    var keys = Object.keys(purchaseOrdersPending);
    var date = generateNextOrderDate();
    var totalLoopTimings = Math.floor(Math.random() * 20) + 1;
    for (var j = 0; j <= totalLoopTimings; j++) {
        var index = Math.floor(Math.random() * keys.length) + 1;
        var po = purchaseOrdersPending[keys[index]];
        if (!!po) {
            po.status = "transit";
            po.updatedAt = date;
            purchaseOrdersinTransit[keys[index]] = po;
            delete purchaseOrdersPending[keys[index]];
            updatePO(po);
        }
    }
}, null, true, timeZone);

new CronJob('00 */17 * * * *', function () {
    console.log('Pick Purchase Order in received');
    var keys = Object.keys(purchaseOrdersinTransit);
    var date = generateNextOrderDate();
    var totalLoopTimings = Math.floor(Math.random() * 20) + 1;
    for (var j = 0; j <= totalLoopTimings; j++) {
        var index = Math.floor(Math.random() * keys.length) + 1;
        var po = purchaseOrdersinTransit[keys[index]];
        if (!!po) {
            po.status = "received";
            po.updatedAt = date;
            inventories[keys[index]].quantity = inventories[keys[index]].quantity + po.quantity;
            delete purchaseOrdersinTransit[keys[index]];
            updatePO(po);
        }
    }
}, null, true, timeZone);


function getInventories() {
    if (!started) {
        started = true;
        INV.find().exec(function (err, things) {
            if (!err) {
                things.forEach(function (inv) {
                    inventories[inv.storeId + "_" + inv.upc] = inv;
                });
                new CronJob('* * * * * *', function () {
                    setTimeout(generatePOS, 0);
                }, null, true, timeZone);
            }
        });
    }
}
var date = 1357007400000;
function generateNextOrderDate() {
    if (date < Date.now()) {
        date = date + Math.floor(Math.random() * 60 * 10000) + 1000;
        var validDate = new Date(date);
        while (validDate.getHours() < 8 || validDate.getHours() > 21) {
            date = date + Math.floor(Math.random() * 60 * 10000) + 1000;
            validDate = new Date(date);
        }
        return validDate.getTime();
    } else {
        return Date.now();

    }

}

function eventGenerated(topic, message) {
    var payload = [{topic: topic, messages: message}];
    producer.send(payload, function (err) {
        if (err) console.log('error' + err);
    });

    console.log(topic + ":" + message);

    listeners.forEach(function (l) {
        if (l.req.socket.isActive) {
            l.res.write(topic + ":" + message + "\n");
        }
        else {
            listeners.splice(listeners.indexOf(l), 1);
        }
    })
}

function createPO(order) {
    eventGenerated("PURCHASE_ORDER", JSON.stringify(order));
    PUR_ORDER.create(order, function (err, po) {
        if (err) {
            console.error(err);
        }
    });
}

function updatePO(order) {
    eventGenerated("PURCHASE_ORDER", JSON.stringify(order));
    PUR_ORDER.update({upc: order.upc, storeId: order.storeId}, order, function (err, po) {
        if (err) {
            console.error(err);
        }
    });
}

function preparePOS(inv) {
    var prob3 = Math.random();
    PROD.findOne({upc: inv.upc}).lean().exec(function (err, res) {
        var p = res;
        var date = generateNextOrderDate();
        var timeout = 0;
        if (date - Date.now() > 0) {
            timeout = date - Date.now();
        }
        setTimeout(function () {
            var sku = p.itemId;
            var upc = p.upc;
            var cat = p.categoryPath;
            var brand = p.brandName;
            var store = inv.storeId;
            var price = p.salePrice || (Math.random() * 10).toFixed(2);
            var quan = Math.floor(Math.random() * 100) + 1;
            var total = (quan * price).toFixed(2);
            var tType = 1;
            var isValid = false;
            if (prob3 > 0.9) {
                isValid = true;
                tType = 0;
            }
            else if (inv.quantity >= quan) {
                isValid = true;
            } else {
                var order = {};
                order.upc = p.upc;
                order.storeId = inv.storeId;
                var key = order.storeId + "_" + order.upc;
                if (!purchaseOrdersPending[key] && !purchaseOrdersinTransit[key]) {
                    purchaseOrders[key] = order;
                }

            }
            if (isValid) {
                var str = date + "|" + sku + "|" + upc + "|" + cat + "|" + brand + "|" + store + "|" + quan + "|" + price + "|" + total + "|" + tType;
                if (!tType) {
                    quan = -quan;
                }
                inv.quantity = inv.quantity - quan;
                createPOS(str)
            }
        }, timeout);


    });
}

function createPOS(pos) {
    POS.create({pos: pos}, function (err, po) {
        if (err) {
            console.error(err);
        }
        eventGenerated("POS", pos);
    });

}


function generatePOS() {
    var keys = Object.keys(inventories);
    var totalLoopTimings = Math.floor(Math.random() * 20) + 1;
    for (var j = 0; j <= totalLoopTimings; j++) {
        var index = Math.floor(Math.random() * keys.length) + 1;
        var i = inventories[keys[index]];
        if (!!i) {
            preparePOS(i);
        }
    }
}
getInventories();

exports.start = function (req, res) {

    return res.status(200, "POS Started Successfully");
}

exports.generate = function (req, response) {
    req.socket.isActive = true;
    listeners.push({req: req, res: response});
};

exports.indexPOS = function (req, response) {
    var stream = POS.find().stream();
    stream.on('data', function (doc) {
        response.write(JSON.stringify(doc))
    });
    stream.on('close', function () {
        return response.status(200);
    });
};


exports.indexProduct = function (req, res) {
    PROD.find().exec(function (err, things) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, things);
    });
};

exports.indexInv = function (req, res) {
    INV.find().exec(function (err, things) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, things);
    });
};

exports.indexCat = function (req, res) {
    CAT.find().exec(function (err, things) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, things);
    });
};

exports.indexPO = function (req, res) {
    PUR_ORDER.find().exec(function (err, things) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, things);
    });
};
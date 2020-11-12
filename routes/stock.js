const router = require("express").Router();
const getDb = require("../_helpers/db").getDb;
const base_response = require("../_helpers/base_response").response;

MongoClient = require('mongodb');


// add new item to stock
router.post("/add-new-item-stock", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({"UserID": new MongoClient.ObjectID(req.body.UserID), "VendorID" : new MongoClient.ObjectID(req.body.VendorID)})
    .toArray((err, result) => {
        //res.json({ status: "error", message: "Vendor not exit" });
        var insert_data =''
        if (req.body.type === "goods") {
          insert_data = {
          UserID   :    new MongoClient.ObjectID(req.body.UserID),
          VendorID : new MongoClient.ObjectID(req.body.VendorID),
          type: "goods",
          item: req.body.item,
          description: req.body.description,
          units: req.body.units,
          HSN: req.body.HSN,
          stock: req.body.initialStock,
          initialStock: req.body.initialStock,
          asOfDate: req.body.asOfDate,
          lowStockAlert: req.body.lowStockAlert,
          salesPrice: Number(req.body.salesPrice),
          purchasePrice: Number(req.body.purchasePrice),
          tax: req.body.tax,
          changeLog: []
        }
      }else if (req.body.type === "services") {
        insert_data = {
          UserID   :    new MongoClient.ObjectID(req.body.UserID),
          VendorID : new MongoClient.ObjectID(req.body.VendorID),
          type: "services",
          item: req.body.item,
          description: req.body.description,
          units: req.body.units,
          SAC: req.body.SAC,
          salesPrice: Number(req.body.salesPrice),
          tax: req.body.tax,
          changeLog: [],
        };
      }

        db.collection("stock")
          .insertOne(insert_data)
          .then(() => {
            res.json(base_response(1,insert_data,'Stock Add Successfully'));
          })
          .catch(() => {
            res.json(base_response(0,{},'Stock Not Added'));
          });
    });
});



// update item to stock
router.post("/update-item-stock", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({_id : new MongoClient.ObjectID(req.body.StockID)})
    .toArray((err, result) => {
     if(result.length !=0){
        //res.json({ status: "error", message: "Vendor not exit" });
        var update_data =result[0]; 
        if (req.body.type === "goods") {
          
          update_data.item  =  req.body.item;
          update_data.description = req.body.description;
          update_data.HSN = req.body.HSN;
          update_data.stock = req.body.initialStock;
          update_data.initialStock = req.body.initialStock;
          update_data.asOfDate = req.body.asOfDate;
          update_data.lowStockAlert = req.body.lowStockAlert;
          update_data.salesPrice = Number(req.body.salesPrice);
          update_data.purchasePrice = Number(req.body.purchasePrice);
          update_data.tax = req.body.tax;
      }else if (req.body.type === "services") {
          update_data.item = req.body.item;
          update_data.description = req.body.description;
          update_data.SAC =  req.body.SAC;
          update_data.salesPrice = Number(req.body.salesPrice);
          update_data.tax = req.body.tax;
      }

        db.collection("stock")
          .update({ _id : new MongoClient.ObjectID(req.body.StockID) }, update_data)
          .then(() => {
            res.json(base_response(1,update_data,'Stock Add Successfully'));
          })
          .catch(() => {
            res.json(base_response(0,update_data,'Stock Not Added'));
          });
        }else{
          res.json(base_response(0,{},'Item not available in the system'));
        }
    });
});



// get all the item stock based on the userid id....
router.get("/get-all-item-stock", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({"UserID": new MongoClient.ObjectID(req.query.UserID)})
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'Item socks not available.'));
      } else {
        res.json(base_response(1,result,'all the stocks loaded successfully'));
      }
    });
});


// get all the item stock based on the userid id....
router.get("/get-all-item-stock", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({"UserID": new MongoClient.ObjectID(req.query.UserID)})
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'Item socks not available.'));
      } else {
        res.json(base_response(1,result,'All the stocks loaded successfully'));
      }
    });
});


// get single the item stock based on the sock id....
router.get("/get-single-item-stock", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({_id: new MongoClient.ObjectID(req.query.StockID)})
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'Item socks not available.'));
      } else {
        res.json(base_response(1,result[0],'Stock loaded successfully'));
      }
    });
});


// adjust the quantity of a stock based on stock item id
router.post("/adjust-stock-quantity", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({ _id : new MongoClient.ObjectID(req.body.StockID)  })
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'This stock not available'));
      } else {
         if(req.body.action ==='add'){
          result[0].stock += Number(req.body.quantity);
         }else if(req.body.action ==='reduce'){
          result[0].stock -= Number(req.body.quantity);
         }
          result[0].changeLog.push({
            date: new Date(Date.now()).toISOString().split('.')[0],
            quantity: Number(req.body.quantity),
            action : req.body.action,
            displayquantity: (req.body.action ==='add'?'+'+req.body.quantity:'-'+req.body.quantity),
            reason: req.body.reason,
          });
          db.collection("stock")
            .update({ _id : new MongoClient.ObjectID(req.body.StockID) }, result[0])
            .then((stat) => {
              res.json(base_response(1,{},'Stock adjusted successfully'));
            })
            .catch((err) => {
              console.log(err);
              res.json(base_response(0,{},'something woring, stock adjusted not successfully'));
            });
      }
    });
});

///// get all the stock adjusment history with the sockid
router.get("/adjustment-stock-all-history", (req, res) => {
  const db = getDb();
  db.collection("stock")
    .find({_id : new MongoClient.ObjectID(req.query.StockID)})
    .toArray((err, result) => {
      if (result.length === 0) {
          res.json(base_response(0,{},'Stock not available'));
      } else {
          res.json(base_response(1,result[0].changeLog,'Adjustment history load successfully'));
      }
    });
});

module.exports = router;

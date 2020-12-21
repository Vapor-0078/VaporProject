const { response } = require("../_helpers/base_response");

const router = require("express").Router();
const getDb = require("../_helpers/db").getDb;
const base_response = require("../_helpers/base_response").response;

MongoClient = require('mongodb');
var table = 'Purchase';
var table_v = 'Vendors';
var table_s = 'stock';

// stocks test route
router.get("/test", (req, res) => {
    res.status(200).json(base_response('ok',{},'Purchase test api running successfully'));
  });


  // Initialize purchase system.
router.post("/initialize-purchase", (req, res) => {
    if(req.body.UserID){
        const db = getDb();
        let purchase_initial_data = {UserID : new MongoClient.ObjectID(req.body.UserID),
                                     status:0,
                                     item:[]}
              db.collection(table)
                .insertOne(purchase_initial_data)
                .then(() => {
                  res.json(base_response(1,purchase_initial_data,'Purchase initialize Successfully'));
                })
                .catch(() => {
                  res.json(base_response(0,{},'Purchase not initialize'));
                });
        }else{
            res.json(base_response(0,{},'Validation in processing request.'));
        }
    
      });

// add item in the purchase intial system
router.post("/add-item-in-purchase", (req, res) => {
  if(req.body.PurchaseID && req.body.StockID){
    const db = getDb();
  db.collection(table)
    .find({ _id : new MongoClient.ObjectID(req.body.PurchaseID)  })
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'This Purshace id not available'));
      } else {
        var item_data;
        if (req.body.type === "goods") {
         
          var discount_charge;
          var discount_amount = 0;
          var gst_charge;
          var gst_amount = 0;
          var subtotal_amount = Number(req.body.rate)*Number(req.body.quantity);
          var shipping_amount = req.body.shipping_amount;
          var total_amount;
          if(req.body.discount_type == 'P'){
            discount_amount = subtotal_amount*(req.body.discount_charge)/100;
          }else if (req.body.discount_type == 'R'){
            discount_amount = req.body.discount_charge;
          }
          gst_amount = req.body.gst_charge*(subtotal_amount)/100;

          total_amount = subtotal_amount+discount_amount+gst_amount+Number(shipping_amount);

          item_data = {
            date: new Date(Date.now()).toISOString().split('.')[0],
            StockID: new MongoClient.ObjectID(req.body.StockID),
            type: req.body.type,
            HSN: req.body.HSN,
            quantity: Number(req.body.quantity),
            item : req.body.item,
            rate : Number(req.body.rate),
            discount_type : req.body.discount_type,
            discount_charge : req.body.discount_charge,
            discount_amount : discount_amount,
            gst_charge : req.body.gst_charge,
            gst_amount : gst_amount,
            subtotal_amount : subtotal_amount, 
            shipping_amount : shipping_amount,
            total_amount : Number(total_amount.toFixed(2))
            };

        }else if (req.body.type === "services") {

          var discount_charge;
          var discount_amount = 0;
          var gst_charge;
          var gst_amount = 0;
          var subtotal_amount = Number(req.body.rate)*Number(req.body.quantity);
          var shipping_amount = 0;
          shipping_amount = req.body.shipping_amount;
          var total_amount;
          if(req.body.discount_type =="P"){
            discount_amount = subtotal_amount*(req.body.discount_charge)/100;
          }else if (req.body.discount_type == "R"){
            discount_amount = discount_charge;
          }
          gst_amount = req.body.gst_charge*(subtotal_amount)/100;

          total_amount = subtotal_amount+discount_amount+gst_amount+Number(shipping_amount);

          item_data = {
            date: new Date(Date.now()).toISOString().split('.')[0],
            StockID: new MongoClient.ObjectID(req.body.StockID),
            type: req.body.type,
            SAC: req.body.SAC,
            quantity: Number(req.body.quantity),
            item : req.body.item,
            rate : req.body.rate,
            discount_type : req.body.discount_type,
            discount_charge : req.body.discount_charge,
            discount_amount : discount_amount,
            gst_charge : req.body.gst_charge,
            gst_amount : gst_amount,
            subtotal_amount : subtotal_amount, 
            shipping_amount : shipping_amount,
            total_amount : Number(total_amount.toFixed(2)),
            
            };
        }
          result[0].item.push(item_data);
          db.collection(table)
            .update({ _id : new MongoClient.ObjectID(req.body.PurchaseID)}, result[0])
            .then((stat) => {
              res.json(base_response(1,result[0],'Item add in purchase successfully'));
            })
            .catch((err) => {
              console.log(err);
              res.json(base_response(0,{},'something woring, item not add in purchase system'));
            });
      }
    });
    }else{
        res.json(base_response(0,{},'Validation in processing request.'));
    }
  
});


// add item in the purchase intial system
router.post("/create-purchase", (req, res) => {
  if(req.body.PurchaseID){
    const db = getDb();
  db.collection(table)
    .find({ _id : new MongoClient.ObjectID(req.body.PurchaseID)  })
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'This Purshace id not available'));
      } else {
        result[0].VendorID =new MongoClient.ObjectID(req.body.VendorID);
        result[0].totalAmount = req.body.totalAmount;
        result[0].receivedAmount = req.body.receivedAmount;
        result[0].paymentMode = req.body.paymentMode;
        result[0].notes = req.body.notes;
        result[0].podate = new Date(req.body.podate);
        result[0].ponumber = req.body.ponumber;
        result[0].status = 1;

          if (req.body.paymentMode === "cheque") {
            result[0].chequeNo = req.body.chequeNo;
          }
          let all_item = result[0].item;
          if(all_item.length != 0){
            all_item.forEach((e, i) => {
              paramsdata = {_id:new MongoClient.ObjectID(e.StockID)};
              if(e.type == "goods"){
                db.collection(table_s).findOne(paramsdata, function(err, stock_data) {
                  stock_data.stock += Number(e.quantity);
                  db.collection(table_s)
                  .update({ _id : new MongoClient.ObjectID(e.StockID)},stock_data)
                  .then((stat) => {
                  })
                  .catch((err) => {
                  })
                });
              }
            });
          
          }




          db.collection(table)
            .update({ _id : new MongoClient.ObjectID(req.body.PurchaseID)}, result[0])
            .then((stat) => {
              res.json(base_response(1,result[0],'Purchase successfully'));
            })
            .catch((err) => {
              console.log(err);
              res.json(base_response(0,{},'something woring, purchase  not in system'));
            });
      }
    });
    }else{
        res.json(base_response(0,{},'Validation in processing request.'));
    }
  
});

// get single purchase data.
router.post("/get-purchase-on-purchase-page", (req, res) => {
  if(req.body.PurchaseID){
  const db = getDb();
  db.collection(table)
    .find({_id: new MongoClient.ObjectID(req.body.PurchaseID)})
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'purchase not available.'));
      } else {
        res.json(base_response(1,result[0],'Purchase loaded successfully'));
      }
    });
  }else{
    res.json(base_response(0,{},'Validation in processing request.'));
}
}); 

// get single purchase data.
router.post("/get-single-purchase", (req, res) => {
  if(req.body.PurchaseID){
  const db = getDb();
  db.collection(table)
    .find({_id: new MongoClient.ObjectID(req.body.PurchaseID),status : 1 })
    .toArray((err, result) => {
      if (result.length === 0) {
        res.json(base_response(0,{},'purchase not available.'));
      } else {
        res.json(base_response(1,result[0],'Purchase loaded successfully'));
      }
    });
  }else{
    res.json(base_response(0,{},'Validation in processing request.'));
}
});


// route to get purchase
router.post("/get-purchase", (req, res) => {
  let sortBy = req.body.sortBy === "oldest" ? 1 : -1;
  db.collection(table)
    .find({UserID: new MongoClient.ObjectID(req.body.UserID), status :1})
    .sort({ date: sortBy })
    .toArray((err, purchases) => {
      if (purchases.length === 0) {
        res.json(base_response(1,[],'NO Purchase loaded successfully'));
      } else {
        let result;
        if (req.body.type === "all") {
          result = purchases;
        } else if (req.body.type === "paid") {
          result = purchases.filter((e) => {
            return e.totalAmount - e.receivedAmount == 0;
          });
        } else if (req.body.type === "unpaid") {
          result = purchases.filter((e) => {
            return e.totalAmount - e.receivedAmount == e.totalAmount;
          });
        } else if (req.body.type === "partial") {
          result = purchases.filter((e) => {
            return (
              e.totalAmount - e.receivedAmount > 0 &&
              e.totalAmount - e.receivedAmount != e.totalAmount
            );
          });
        }else{
          result = purchases;
        }


        db.collection(table_v)
          .find({ Client_id: new MongoClient.ObjectID(req.body.UserID) })
          .toArray((err, vendors) => {
            let v = vendors;
            result.forEach((e, i) => {
              result[i].SupplierName = v.find((x) => {
                return JSON.stringify(x._id)==JSON.stringify(e.VendorID)
              }).SupplierName;
            });
            res.json(base_response(1,result,'Purchase loaded successfully'));
          });
      }
    });
});

module.exports = router;
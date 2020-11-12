const express = require('express'),
  https = require('https'),
  app = express(),
  multer = require('multer'),
  upload = multer(),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  assert = require('assert'),
  f = require('util').format,
  fs = require('fs'),
  path = require('path'),
  url = require('url');

const initDb =  require('./_helpers/db').initDb;
const getDb = require("./_helpers/db").getDb;


const stockRoute = require("./routes/stock");

nodemailer = require('nodemailer');

const port = process.env.PORT || 5000;

const mongoose = require('mongoose');

let user, password;

user = encodeURIComponent('Vapormongo');
password = encodeURIComponent('Vapormongo@AI');
protocol = 'http://',
  hostname = '127.0.0.1',
  //port = 8006,
  MongoClient = require('mongodb'),
  authMechanism = 'DEFAULT',
  //mongoUrl = f('mongodb://localhost:27017/')
mongoUrl = f('mongodb+srv://vaporinterface:vt0iJDfoBWztddOV@cluster0.9e6oi.mongodb.net/TestVapor?retryWrites=true&w=majority');
dbName = 'Vapor',
  nodemailer = require('nodemailer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads', '../Vapor_Backend');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 750 * 450 * 3
  },
  fileFilter: fileFilter
});
var uploadfile = multer({ storage: storage });

let smtpAuth;

// smtpAuth = {
//   user: 'sangeetaverma9211@gmail.com',
//   pass: 'Sangeeta@123'
// }
smtpAuth = {
    user: 'developer.amityadav@gmail.com',
    pass: 'Love@143'
  }

let smtpConfig = {
  service: 'Gmail',
  auth: smtpAuth
};
let transporter = nodemailer.createTransport(smtpConfig);

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

application = require('./application'),
  imageCard = require('./Vapor_Backend/uploads/imageCard'),

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
      return res.send(200);
    } else {
      return next();
    }
  });

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(express.static('uploads'));
app.use(express.static('Vapor_Backend'));
app.use("/api/stock", stockRoute);


   initDb(function (err) {
    db = getDb();
//      MongoClient.connect(mongoUrl, (err, client) => {     
//        assert.equal(null, err);
//        db = client.db(dbName);
          
        app.post('/SignUp', (req, res)=> application.SignUp(req, res, db, MongoClient));
        app.post('/SignIn', (req, res)=> application.SignIn(req, res, db, MongoClient));
        app.post('/SignOut', (req, res)=> application.SignOut(req, res, db, MongoClient));
        app.post('/UpdatPersonalInfo', (req, res)=> application.UpdatPersonalInfo(req, res, db, MongoClient));
        app.post('/ChangePersonalpwd', (req, res)=> application.ChangePersonalpwd(req, res, db, MongoClient));
        app.post('/SendOtp', (req, res)=> application.SendOtp(req, res, db, MongoClient,transporter));
        app.post('/VerifyVaporOtp', (req, res)=> application.VerifyVaporOtp(req, res, db, MongoClient));
        app.post('/SendEmailOtp', (req, res)=> application.SendEmailOtp(req, res, db, MongoClient,transporter));
        app.post('/VerifyEmailOtp', (req, res)=> application.VerifyEmailOtp(req, res, db, MongoClient));
        app.post('/ForgotpwdUpdate', (req, res)=> application.ForgotpwdUpdate(req, res, db, MongoClient));
          
        app.post('/FetchPersonalInfo', (req, res)=> application.FetchPersonalInfo(req, res, db, MongoClient));

        app.post('/FetchBusinessInfo', (req, res)=> application.FetchBusinessInfo(req, res, db, MongoClient));
        app.post('/UpdateBusinessInfo', (req, res)=> application.UpdateBusinessInfo(req, res, db, MongoClient));
        
        app.post('/fetchBankingDetails', (req, res)=> application.fetchBankingDetails(req, res, db, MongoClient));
        app.post('/UpdateBankingDetails', (req, res)=> application.UpdateBankingDetails(req, res, db, MongoClient));
        
        app.post('/FetchProfilephoto', (req, res)=> application.FetchProfilephoto(req, res, db, MongoClient));
        app.post('/UpdateProfilePhoto',uploadImage.single('imagename'), (req, res)=> application.UpdateProfilePhoto(req, res, db, MongoClient));  

        app.post('/fetchbusinesslogo', (req, res)=> application.fetchbusinesslogo(req, res, db, MongoClient));   
        app.post('/Updatebusinesslogo', (req, res)=> application.Updatebusinesslogo(req, res, db, MongoClient));      
        
        app.post('/CardImage',(req, res) => imageCard.cardImage(req, res, db, MongoClient));
        app.post('/SendImageInMail', (req, res) => application.SendImageInMail(req, res, db, MongoClient, transporter, protocol, hostname, port));
        app.post('/fetchCustomers', (req, res) => application.fetchCustomers(req, res, db, MongoClient));
        app.post('/fetchVendor', (req, res) => application.fetchVendor(req, res, db, MongoClient));
        app.get('/fetchCatagories', (req, res) => application.fetchCatagories(req, res, db, MongoClient));
        app.post('/AddCatagories', (req, res) => application.AddCatagories(req, res, db, MongoClient));
        app.post('/AddCustomers', (req, res) => application.AddCustomers(req, res, db, MongoClient));
        app.post('/AddVendors', (req, res) => application.AddVendors(req, res, db, MongoClient));
        app.post('/EditCustomer', (req, res) => application.EditCustomer(req, res, db, MongoClient));
        app.post('/EditVendor', (req, res) => application.EditVendor(req, res, db, MongoClient));
        app.get('/', (req, res) => {
            res.send('Wellcome to Vapor')
          });

     app.listen(port, () => console.log('Started successfully on port 5000!'));
        });
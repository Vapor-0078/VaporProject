const { MongoClient } = require('mongodb');

const express = require('express'),
      https = require('https'),
      app = express(),
      bodyParser = require('body-parser'),
      cookieParser = require('cookie-parser'),
      assert      = require('assert'),
      f           = require('util').format,
      fs          = require('fs'),
      path        = require('path'),
      url        = require('url');

      module.exports = {
        SignUp: async(req, res, db, MongoClient)=>{
            db.collection('Client_detail').find({
                email: req.body.email,
                role: 2
              })
                .toArray((err, result) => {
                  if (err) {
                    res.end();
                    throw err;
                  }
                  if (result.length) {
                    res.send(JSON.stringify({
                      code: 0,
                      msg: 'E-mail already exists in the system'
                    }));
                  } else {
                    db.collection('Client_detail')
                      .insertOne({
                        "name" : req.body.name,
                        "email" : req.body.email,
                        "MobileNo": req.body.Mobile,
                        "pwd": req.body.pwd,
                        "datetime":new Date(Date.now()).toISOString().split('.')[0],
                        "role": 2
                      }, (err, result) => {
                        if (err) {
                          res.send(JSON.stringify({
                            code: 1,
                            msg: 'We are veryv sorry there is some error ocurrs'
                          }));
                          console.log(err);
                        } else {
                          console.log(result.insertedId);
                          db.collection('Business_detail')
                            .insertOne({
                                "name" : req.body.name,
                                "email" : req.body.email,
                                "MobileNo": req.body.Mobile,
                                "role": 2,
                                "userId":new MongoClient.ObjectID(result.insertedId),
                                "datetime":new Date(Date.now()).toISOString().split('.')[0]
                            });
                            db.collection('Banking_details')
                            .insertOne({
                                "MobileNo": req.body.Mobile,
                                "userId":new MongoClient.ObjectID(result.insertedId)
                            });
                            db.collection('ProfilePhoto')
                            .insertOne({
                                "Description":"profile photo",
                                "userId":new MongoClient.ObjectID(result.insertedId)
                            });
                          res.send(JSON.stringify({res: 'You are registered successfully'}));
                        }
                      });
                  }
                }); 
            },

            SignIn: (req, res, db , MongoClient) => {
                let Mobile = req.body.Mobile,
                    pwd = req.body.pwd,
                    user;
                console.log(req.cookies);
                db.collection('Client_detail').find({"MobileNo":Mobile})
                  .toArray((err, result) => {
                    if (err) {
                      res.end();
                      throw err;
                    }
                    console.log(result);
                    if (!result.length) {
                      let error = {
                        code: 0,
                        msg: 'No user with such number registered'
                      };
                      res.send(JSON.stringify(error));
                    } else {
                      user = result[0];
                      if (pwd == user.pwd) {
                        res.cookie('uid', Math.random().toString().substring(2), { maxAge: 31536000000, httpOnly: true });
                        res.send(JSON.stringify({
                          name: user.name,
                          email: user.email,
                          userId: user._id,
                          Signature:user.Signature
                        }));
                      } else {
                        let error = {
                          code: 1,
                          msg: 'Make sure you have entered the right password'
                        };
                        res.send(JSON.stringify(error));
                      }
                    }
                    
                  });
              },

              UpdatPersonalInfo:(req, res, db, MongoClient)=>{
                if(!req.body.userId){
                  throw "you do not selsect user ID"
                }
                
               db.collection('Client_detail').updateMany({
                _id: new MongoClient.ObjectID(req.body.userId)
               },{
                 $set:{
                  "name" : req.body.name,
                  "email" : req.body.email,
                  "MobileNo": req.body.Mobile,
                  "pwd": req.body.pwd,
                  "Signature":req.body.Signature
                 }}, {
                  multi: true
                },
                db.collection('Business_detail').updateMany({
                  userId: new MongoClient.ObjectID(req.body.userId)
                 },{
                   $set:{
                    "name" : req.body.name,
                    "email" : req.body.email,
                    "MobileNo": req.body.Mobile
                   }}, {
                    multi: true
                  }));
                
                res.send(JSON.stringify("your personal details is updated"))
              },
              
              FetchBusinessInfo:(req, res, db, MongoClient)=>{
                db.collection('Business_detail').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray((err, result)=>{
                  if(err){
                    res.end();
                    throw err;
                  }
                  res.send(JSON.stringify(result));
                })
              },


              UpdateProfilePhoto:(req, res, db, MongoClient)=>{
                console.log("request param file ",req.file);
                let newpath=req.file.path;
                console.log("req file path",req.file.path);
                console.log("newpath",newpath);
                let Imagepath = newpath.split("\\");
                Imagepath= newpath.split("/")
                console.log("image path",Imagepath);
                // console.log(req.file.originalname);
                let imagepath = 'https://vaporbackend.herokuapp.com/'+Imagepath[1];
                db.collection('ProfilePhoto').updateMany({userId: new MongoClient.ObjectID(req.body.userId)},
                {
                  $set:{
                    "imagename": req.file.originalname,
                    "Imagepath":imagepath,
                  }

                },{
                  multi:true
                })
                res.send(JSON.stringify("your profile photo uploded"));
              },

              Updatebusinesslogo:(req, res, db, MongoClient)=>{
                // console.log("request param file", req.file);
                // //console.log("request param file ",req.file);
                // let newpath=req.file.path;
                // console.log("req file path",req.file.path);
                // console.log("newpath",newpath);
                // let Imagepath = newpath.split("\\");
                // Imagepath= newpath.split("/")
                // console.log("image path",Imagepath);
                // // console.log(req.file.originalname);
                // let imagepath = 'Localhost:8000/'+Imagepath[1]
               
                db.collection('Business_detail').updateMany({userId:new MongoClient.ObjectID(req.body.userId)},
                {
                  $set:{
                    // "Upload_Logo": req.file.originalname,
                    // "Logopath":imagepath
                    $set: {
                      "logo": req.body.logo
                    }
                  }
                },{
                  multi:true
                })
                res.send(JSON.stringify("your Business logo is updated"))

              },
              UpdateBusinessInfo:(req, res, db, MongoClient)=>{
                
                db.collection('Business_detail').updateMany({userId:new MongoClient.ObjectID(req.body.userId)},
                {
                  $set:{
                    "Business_Name": req.body.BusinessName,
                    "Business_Tag_Line": req.body.TagLine,
                    "Address": req.body.address,
                    "City":req.body.city,
                    "State":req.body.state,
                    "Pin_Code":req.body.Code,
                    "Country":req.body.Country,
                    "GSTNumber": req.body.GSTNumber,
                    "currency": req.body.currency
                  }
                },{
                  multi:true
                })
                res.send(JSON.stringify("your Business details is updated"))
              

              },

              fetchBankingDetails:(req, res, db, MongoClient)=>{
                db.collection('Banking_details').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray((err, result)=>{
                  if(err){
                    res.end();
                    throw err;
                  }
                  res.send(JSON.stringify(result));
                })
              },

             

              UpdateBankingDetails:(req, res, db, MongoClient)=>{
                db.collection('Banking_details').update({userId:new MongoClient.ObjectID(req.body.userId)},
                {
                  $set:{
                    "BankName": req.body.BankName,
                    "AccountHolderName": req.body.AccountHolder,
                    "AccountNumber":req.body.AccountNumber,
                    "IFSCCode": req.body.IFSC
                  }
                },{
                  multi:true
                })
                res.send(JSON.stringify("your Business details is updated"))
              

              },

              FetchProfilephoto:(req, res, db, MongoClient)=>{
                db.collection('ProfilePhoto').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray((err, result)=>{
                  if(err){
                    res.end();
                    throw err;
                  }
                  res.send(JSON.stringify(result));
                })

              },


              FetchPersonalInfo:(req, res, db, MongoClient)=>{
                db.collection('Client_detail').find({_id:new MongoClient.ObjectID(req.body.userId)}).toArray((err, result)=>{
                  if(err){
                    res.end();
                    throw err;
                  }
                  res.send(JSON.stringify(result));
                })

              },

              fetchbusinesslogo:(req, res, db, MongoClient)=>{
                db.collection('Business_detail').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray((err, result)=>{
                  if(err){
                    res.end();
                    throw err;
                  }
                  res.send(result[0].logo);
                })
              },

              SignOut: (req, res, db) => {
                res.clearCookie('uid');
                res.send(JSON.stringify({res: 'logged out'}));
              },

           cardImage:async(req, res, db, MongoClient)=>{        
              let result= await db.collection('Business_detail').find({userId:new MongoClient.ObjectID(req.body.userId)}).toArray();
              console.log(result);
              var owner = result[0].name
              var Businsess= result[0].Business_Name;
              var Business_Tag_Line= result[0].Business_Tag_Line;
              console.log(Businsess);
              var E_address= result[0].email;
              var Contact = result[0].MobileNo;
              var Address = result[0].Address;
              var City = result[0].City;
              var State = result[0].State;
              var Pin_Code= result[0].Pin_Code;
              var Country = result[0].Pin_Code;
              var Logopath = result[0].Logopath;
              console.log(Logopath);
              Imagepath = "B_Card"+Math.random().toString(36).substr(2, 9);

              var path = "https://vaporbackend.herokuapp.com/"+Imagepath+'.png';
              let imagetemplet = await imageCard.genrateInvoiceImage(owner, Businsess, Business_Tag_Line, E_address, Contact, Address, City, State, Pin_Code, Country, Logopath, Imagepath);
              console.log(imagetemplet)
              db.collection('Business_detail').updateMany({userId:new MongoClient.ObjectID(req.body.userId)}, {
                $set:{
                 "Business_Card":path
                }
              },{
                multi:true
              })
              res.send('you card has been genraated');
              },

              SendImageInMail: (req, res, db, MongoClient, transporter, protocol, hostname, port) => {
       
                db.collection('Business_detail').find({
                  userId:new MongoClient.ObjectID(req.body.userId)
                }).toArray((err, result) => {
                    if (err) {
                        res.end();
                        throw err;
                    }
                    try{
                    console.log('checking id', result[0].Business_Card);
                                         
                       if (result.length) {
                        transporter.sendMail({
                          from: {
                            name: 'Customers',  
                            address: 'noreply@spotyourdeals.com'
                          },
                            to: req.body.email,
                            subject: result[0].BusinessName+'Business Card',
                            // text: 'Tapestry: Exclusive offer! Here is the promo code: ' + weChatCouponCode,
                            html: `<p>Welcome use given url to see Business card details:</p> 
                                <p>otp : <b><i>${result[0].Business_Card}</i></b></p>`
                        }, (err, info) => {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(info);
                            }
                        });
        
                        res.send(JSON.stringify({ res: 'ok'}));
        
                    } else {
                        res.send(JSON.stringify({ res: 'no user with this email found' }));
                    }
               
               
        
                } catch(e){
                    console.log(e);
                }
                });
           
            },

            AddCatagories:async(req, res, db, MongoClient)=>{
              let Catag = req.body.Catag 
              MatchCout = 0;
              let data =  await db.collection('Catagories').find().toArray();
              data.forEach((val) => {
                if(val.Name == Catag){
                  MatchCout = 1;
                 
                }
                else{
                  return;
                }
                });

                console.log('checking for matchcount',MatchCout);
                if (MatchCout == 1){
                  res.send(JSON.stringify("This catagory is already exist!, you can try with another catagories name. !Thanks"));
                  
                }

                else{
                  console.log(Catag);
                  db.collection('Catagories').insertOne({
                    "Name": Catag,
                    "Cat_Discription": req.body.Discription
                  });
                  res.send(JSON.stringify({"Catagory":"inserted succesfully"}));

                }
            },

            fetchCatagories:(req, res, db, MongoClient)=>{
              db.collection('Catagories').find().toArray((err, result)=>{
                if(err){
                  res.end();
                  throw err;
                }
                res.send(JSON.stringify(result));
              })
            },

            fetchCustomers:async(req, res, db, MongoClient)=>{
              let customer = await db.collection('Customers').find({"Client_id": new MongoClient.ObjectID(req.body.Client_id)}).toArray();             
              res.send(JSON.stringify(customer));
            },
            
            fetchVendor:async(req, res, db, MongoClient) =>{
              let vendor = await db.collection('Vendors').find({"Client_id": new MongoClient.ObjectID(req.body.Client_id)}).toArray();
              res.send(JSON.stringify(vendor));
            },

            AddCustomers:async(req, res, db, MongoClient) =>{
              let data = await db.collection('Customers').find({"Client_id": new MongoClient.ObjectID(req.body.Client_id)}).toArray();
              console.log(data)
              try{
              data.forEach((val)=>{
                if(val.email == req.body.email){
                  res.end("this account is already exist");
                  throw"This acount is already added in your business"; 
                }
              })
              if(!req.body.Client_id){
                throw"Client _id must be reuired";
              }

              db.collection('Customers').insertOne({
                "Customername": req.body.name,
                "email": req.body.email,
                "MobileNo": req.body.Mobile,
                "Address": req.body.Address,
                "GSTDetails": req.body.GST_Detail,
                "OpeningBalance": req.body.Balance,
                "InternalNote": req.body.Internal_note,
                "BusinessType": req.body.BusinessType,
                "Client_id": new MongoClient.ObjectID(req.body.Client_id),
                "datetime": new Date(Date.now()).toISOString().split('.')[0]
              });
            }catch (e) {
              console.log(e);
            }
              res.send(JSON.stringify("Customer added successfuly"));
            },           

            AddVendors:async(req, res, db, MongoClient)=>{
              let data = await db.collection('Vendors').find({"Client_id": new MongoClient.ObjectID(req.body.Client_id)}).toArray();
              console.log(data)
              try{
              data.forEach((val)=>{
                if(val.email == req.body.email){
                  res.end("this account is already exist");
                  throw"This acount is already added in your business"; 
                }
              })
              if(!req.body.Client_id){
                throw"Client _id must be reuired";
              }
              db.collection('Vendors').insertOne({
                "SupplierName": req.body.name,
                "email": req.body.email,
                "MobileNo": req.body.Mobile,
                "Address": req.body.Address,
                "GSTDetails": req.body.GST_Detail,
                "OpeningBalance": req.body.Balance,
                "InternalNote": req.body.Internal_note,
                "BusinessType": req.body.BusinessType,
                "Client_id": new MongoClient.ObjectID(req.body.Client_id),
                "datetime": new Date(Date.now()).toISOString().split('.')[0]

              });
            }catch (e) {
              console.log(e);
            }
              res.send(JSON.stringify("Vendor added successfully"));
            },

            EditCustomer:async(req, res, db, MongoClient)=>{
              if(!req.body.CustomerId){
                throw "you do not selsect customer ID"
              }
              db.collection('Customers').updateMany({_id:new MongoClient.ObjectID(req.body.CustomerId)},
                {
                  $set:{

                    "Customername": req.body.name,
                    "email": req.body.email,
                    "MobileNo": req.body.Mobile,
                    "Address": req.body.Address,
                    "GSTDetails": req.body.GST_Detail,
                    "OpeningBalance": req.body.Balance,
                    "InternalNote": req.body.Internal_note,
                    "BusinessType": req.body.BusinessType,
                    "datetime": new Date(Date.now()).toISOString().split('.')[0]
                  }
                },{
                  multi:true
                })
                res.send(JSON.stringify("your Customer details is updated"))
            },

            EditVendor:async(req, res, db, MongoClient)=>{
              if(!req.body.VendorId){
                throw "you do not selsect customer ID"
              }
              db.collection('Vendors').updateMany({_id:new MongoClient.ObjectID(req.body.VendorId)},
                {
                  $set:{
                    "SupplierName": req.body.name,
                    "email": req.body.email,
                    "MobileNo": req.body.Mobile,
                    "Address": req.body.Address,
                    "GSTDetails": req.body.GST_Detail,
                    "OpeningBalance": req.body.Balance,
                    "InternalNote": req.body.Internal_note,
                    "BusinessType": req.body.BusinessType,
                    "datetime": new Date(Date.now()).toISOString().split('.')[0]
                  }
                },{
                  multi:true
                })
                res.send(JSON.stringify("your Vendor details is updated"))
            }



              // FetchPersonalInfo:(req, res, db, MongoClient)=>{
              //   let userId = req.body.userId
              //   db.collection('Client_detail').find({_id:new MongoClient.ObjectID(userId)}).toArray((err, result)=>{
              //     if(err){
              //       res.end();
              //       throw err;
              //     }
              //    res.send(JSON.stringify({
              //      name: result.name,
              //      MobileNo: result.MobileNo,
              //      email: result.email,
              //      Signature:result.Signature
              //    }))

              //   })
              // },
 }
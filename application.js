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
            let mobile_no = req.body.Mobile,
                email_id = req.body.email,
                pwd = req.body.pwd,
                params_data;
            if(mobile_no){
              params_data = {
                MobileNo: mobile_no,
                role: 2};
            }else{
              params_data = {
                email: email_id,
                role: 2};
            }
            if(((mobile_no && mobile_no.length==10) || email_id) && pwd.length>=8){
            db.collection('Client_detail').find(params_data)
                .toArray((err, result) => {
                  if (err) {
                    res.end();
                    throw err;
                  }
                  if (result.length) {
                    res.send(JSON.stringify({
                      code: 0,
                      msg: `${mobile_no?'Mobile-no':'E-mail'} already exists in the system`
                    }));
                  } else {
                    db.collection('Client_detail')
                      .insertOne({
                        "name" : req.body.name,
                        "email" : req.body.email,
                        "country":req.body.country,
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
                                "country":req.body.country,
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
              }else{
                let error = {
                  code: 0,
                  msg: 'some requirement data is missing.'
                };
                if(!mobile_no && !email_id){
                  error.msg = `Please Enter ${req.body.country != 'India'?'Email':'Mobile-no'}`; 
                }else if(mobile_no && mobile_no.length != 10 ){
                  error.msg = `Please Enter 10 digit mobile no.`; 
                }else if(pwd.length<8){
                  error.msg = `Please Enter minimum 8 character password.`; 
                }
                res.send(JSON.stringify(error));
              }
            },

            SignIn: (req, res, db , MongoClient) => {
                let Mobile_no = req.body.Mobile,
                    email_id = req.body.email,
                    pwd = req.body.pwd,
                    user,
                    paramsdata;
                if(Mobile_no){
                  paramsdata = {"MobileNo":Mobile_no};
                }else{
                  paramsdata = {"email":email_id};
                }
                if(Mobile_no || email_id){
                  db.collection('Client_detail').findOne(paramsdata, function(err, result) {
                    if (err) throw err;
                    let success = {
                      code: 1,
                      msg: result
                    };
                    if(!result){
                      let error = {
                              code: 0,
                              msg: `No user with such ${Mobile_no?'number':'email'} registered`
                            };
                            res.send(JSON.stringify(error));
                    }else{
                      user = result;
                      if (pwd == user.pwd) {
                          res.cookie('uid', Math.random().toString().substring(2), { maxAge: 31536000000, httpOnly: true });
                          res.send(JSON.stringify({
                            name: user.name,
                            email: user.email,
                            country: user.country,
                            mobile_no : user.MobileNo,
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
                }else{
                  let error = {
                    code: 0,
                    msg: 'some key is missiong'
                  };
                  res.send(JSON.stringify(error));
                }
                

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
           
             ChangePersonalpwd:(req, res, db, MongoClient)=>{
                if(!req.body.userId){
                  throw "you do not selsect user ID"
                }
                let userId = req.body.userId,
                    CurrentPwd = req.body.CurrentPwd,
                    NewPwd = req.body.NewPwd,
                    ConfNewPwd = req.body.ConfNewPwd,
                    user;
                 if(CurrentPwd && NewPwd && ConfNewPwd && NewPwd == ConfNewPwd){
                   db.collection('Client_detail').find({
                    _id: new MongoClient.ObjectID(req.body.userId)
                    })
                  .toArray((err, result) => {
                    if (err) {
                      res.end();
                      throw err;
                    }
                    console.log(result);
                    if (result.length && result[0].pwd != CurrentPwd){
                      let error = {
                        code: 0,
                        msg: 'Current pasword not matched,Please check current password'
                      };
                      
                      res.send(JSON.stringify(error));
                    } else {
                      user = result[0];
                      db.collection('Client_detail').updateMany({
                        _id: new MongoClient.ObjectID(req.body.userId)
                       },{
                         $set:{
                          "pwd": req.body.ConfNewPwd,
                         }}, {
                          multi: true
                        });
                       let success = {
                        code: 1,
                        msg: 'password change successfully',
                      };
                     res.send(JSON.stringify(success))
                    }
                    
                  });  
                 }else{
                     let error = {
                        code: 0,
                        msg: 'Some key is missing please check.'
                      };
                      if(NewPwd != ConfNewPwd){
                        error.msg = "New password and confirm new password not matched"; 
                      }
                      res.send(JSON.stringify(error)); 
                 }
               
              },
          
          ForgotpwdUpdate:(req, res, db, MongoClient)=>{
                if(!req.body.userId){
                  throw "you do not selsect user ID"
                }
                let userId = req.body.userId,
                    NewPwd = req.body.NewPwd,
                    ConfNewPwd = req.body.ConfNewPwd,
                    user;
                 if(NewPwd && ConfNewPwd && NewPwd == ConfNewPwd && ConfNewPwd.length>=8 && NewPwd.length>=8){

                    db.collection('Client_detail').findOne({ _id: new MongoClient.ObjectID(userId)}, function(err, result) {
                      if (err) throw err;
                    console.log(result);
                    if (!result){
                      let error = {
                        code: 0,
                        msg: 'user not exit in system'
                      };

                      res.send(JSON.stringify(error));
                    } else {
                      user = result;
                      db.collection('Client_detail').updateMany({
                        _id: new MongoClient.ObjectID(userId)
                       },{
                         $set:{
                          "pwd": req.body.ConfNewPwd,
                         }}, {
                          multi: true
                        });
                       let success = {
                        code: 1,
                        data : {
                          name: user.name,
                          email: user.email,
                          country: user.country,
                          mobile_no : user.MobileNo,
                          userId: user._id,
                          Signature:user.Signature},
                        msg: 'password reset successfully',
                      };
                     res.send(JSON.stringify(success))
                    }
                    
                  });  
                 }else{
                     let error = {
                        code: 0,
                        msg: 'Some key is missing please check.'
                      };
                      if(NewPwd != ConfNewPwd){ 
                        error.msg = "New password and confirm new password not matched"; 
                      }
                      if(NewPwd.length<8 ||ConfNewPwd.length<8){
                        error.msg = "Password Enter minimum 8 characters."; 
                      }
                      res.send(JSON.stringify(error)); 
                 }
               
              },
          
          SendOtp:(req, res, db, MongoClient,transporter)=>{
                if(!req.body.Mobile){
                  throw "please enter mobile no."
                }
                let Mobile = req.body.Mobile,
                    Place_use = req.body.Place_use,
                    user;
                 if(Mobile){
                   db.collection('Client_detail').find({"MobileNo":Mobile})
                  .toArray((err, result) => {
                    if (err) {
                      res.end();
                      throw err;
                    }
                    console.log(result);

                    if(Place_use==1 || (Place_use==2 && result.length)){
                      var http = require("https");
                      var options = {
                      "method": "GET",
                      "hostname": "api.msg91.com",
                      "port": null,
                      "path": "/api/v5/otp?extra_param=%7B%22Param1%22%3A%22Value1%22%2C%20%22Param2%22%3A%22Value2%22%2C%20%22Param3%22%3A%20%22Value3%22%7D&unicode=&authkey=344724AiwcRehS5f899fb9P1&template_id=5f89dcdbd6fa743036097b94&mobile=91"+Mobile+"&invisible=1&otp_length=4",
                      "headers": {
                      "content-type": "application/json"
                      }
                      };

                      var reqs = http.request(options, function (ress) {
                      var chunks = [];

                      ress.on("data", function (chunk) {
                      chunks.push(chunk);
                      });

                      ress.on("end", function () {
                      var body = Buffer.concat(chunks);
                      console.log(body.toString());
                      var results = JSON.parse(body.toString());
                            
                        if(results.type=="success"){
                          if(Place_use==1){
                            var success = {
                              code: 1,
                              msg: 'OTP send successfully.',
                            };
                          }else{
                            user = result[0];
                            var success = {
                              code: 1,
                              data: {userId: user._id,mobileno: user.MobileNo},
                              msg: 'OTP send successfully For reset Password.',
                            };
                          }
                          res.send(JSON.stringify(success))
                        }else{
                          let error = {
                              code: 0,
                              msg: 'OTP Not send.',
                            };
                            res.send(JSON.stringify(error))
                          }
                      });
                      });
                      reqs.end();
                    }else{
                      let error = {
                        code: 0,
                        msg: 'User not exit.',
                      };
                      res.send(JSON.stringify(error))
                    }
                    
                  });  
                 }else{
                     let error = {
                        code: 0,
                        msg: 'Some key is missing please check.'
                      };
                      res.send(JSON.stringify(error)); 
                 }
               
              },
          
          VerifyVaporOtp:(req, res, db, MongoClient)=>{

                let vaporsmsOtp = req.body.vaporsmsOtp,
                    Mobile = req.body.Mobile;
                 if(vaporsmsOtp && Mobile){
                      var http = require("https");

                      var options = {
                        "method": "POST",
                        "hostname": "api.msg91.com",
                        "port": null,
                        "path": `/api/v5/otp/verify?otp_expiry=&mobile=91${Mobile}&otp=${vaporsmsOtp}&authkey=344724AiwcRehS5f899fb9P1`,
                        "headers": {}
                      };

                      var reqs = http.request(options, function (ress) {
                      var chunks = [];

                      ress.on("data", function (chunk) {
                      chunks.push(chunk);
                      });

                      ress.on("end", function () {
                      var body = Buffer.concat(chunks);
                      console.log(body.toString());
                      var result = JSON.parse(body.toString());
                            
                        if(result.type=="success"){
                            let success = {
                                code: 1,
                                msg: 'OTP verify successfully.',
                              };
                          res.send(JSON.stringify(success))
                        }else{
                          let error = {
                              code: 0,
                              msg: result.message,
                            };
                            res.send(JSON.stringify(error))
                          }
                      });
                      });

                      reqs.end(); 
                 }else{
                     let error = {
                        code: 0,
                        msg: 'Please enter Otp or enter mobile number.'
                      };
                      res.send(JSON.stringify(error)); 
                 }
               
              },
          
          
          SendEmailOtp:(req, res, db, MongoClient,transporter)=>{

                let email_id = req.body.email,
                    place_use = req.body.place_use; 
                 if(email_id && place_use){
                  db.collection('Client_detail').findOne({email:email_id}, function(err, result) {
                    if (err) throw err;
                    var user_data = result;
                    var otp_value = Math.floor(1000 + Math.random() * 9000);
                    var verification_token = new Date(Date.now()).getTime()+otp_value;
                    
                    console.log()
                    //res.send(JSON.stringify(success)); 
                    if(place_use ==1 || (place_use==2 && user_data)){
                    transporter.sendMail({
                      from: {
                        name: 'Vapor InterFace OTP',  
                        address: 'noreply@gmail.com'
                      },
                        to: email_id,
                        subject: 'Vapor Interface OTP '+ Math.floor(10 + Math.random() * 90),
                        // text: 'Tapestry: Exclusive offer! Here is the promo code: ' + weChatCouponCode,
                        html: `<p>Welcome to vaporInterface:</p> 
                               <p>Your Email- Verification OTP is : <b><i>${otp_value}</i></b></p>`
                    }, (err, info) => {
                        if (err) {
                            console.log(err);
                            let error_res = {
                              code: 0,
                              msg: "email otp not send please retry;"
                            };
                            res.send(JSON.stringify(error_res));         
                        } else {
                          db.collection('Email_otps')
                          .insertOne({
                            "email" :email_id,
                            "verification_token":verification_token.toString(),
                            "otp":otp_value.toString()
                          }, (err, result) => {
                            let success = {
                              code: 1,
                              data : {
                                "email" :email_id,
                                "verification_token":verification_token.toString()
                              },
                              msg: "Otp send please check your mail."
                            };
                            place_use==2?success.data.UserId=user_data._id:'';
                            res.send(JSON.stringify(success)); 
                          });

                        }
                    });
                      
                  }else{
                    let error = {
                      code: 0,
                      msg: place_use==2?'user not exit in our system':'some key is missing'
                    };
                    res.send(JSON.stringify(error)); 
                  }

                  });
                  
                 }else{
                     let error = {
                        code: 0,
                        msg: 'some key is missiong.'
                      };
                      res.send(JSON.stringify(error)); 
                 }
               
              },

              VerifyEmailOtp:(req, res, db, MongoClient)=>{

                let email_id = req.body.email,
                    email_verification_token = req.body.verification_token,
                    otp_value = req.body.otp,
                    params_data; 
                 if(email_id && email_verification_token,otp_value){
                   params_data = {
                     email : email_id,
                     verification_token : email_verification_token,
                     otp : otp_value
                   }
                  db.collection('Email_otps').findOne(params_data, function(err, result) {
                    if (err) throw err;
                    var otp_user_data = result;

                  if(otp_user_data){
                    db.collection('Email_otps').deleteOne( { "_id" : new MongoClient.ObjectID(otp_user_data._id) } );
                      let success = {
                              code: 1,
                              msg: "Email Otp verify successfully."
                            };
                      res.send(JSON.stringify(success)); 
                  }else{
                    let error = {
                      code: 0,
                      msg: 'Please Enter valid OTP'
                    };
                    res.send(JSON.stringify(error)); 
                  }

                  });
                  
                 }else{
                     let error = {
                        code: 0,
                        msg: 'some key is missiong.'
                      };
                      res.send(JSON.stringify(error)); 
                 }
               
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
const express = require('express');
const router = express.Router();

module.exports = {
    response
};
function response(status,data,message) {

 return ({'status':status,'data':data,'message':message});

}
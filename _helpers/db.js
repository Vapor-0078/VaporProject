const MongoClient = require("mongodb").MongoClient;

let _db;
module.exports = {
    getDb,
    initDb
};

function initDb( callback ) {
    const url = "mongodb+srv://vaporinterface:vt0iJDfoBWztddOV@cluster0.9e6oi.mongodb.net/TestVapor?retryWrites=true&w=majority"
    // Database Name
    const dbName = "Vapor";
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
        // if (err) {
        //   console.log("Database Error!");
        // }
        console.log("Connected successfully to stock db");
        _db  =  client.db(dbName);
        return callback(null, _db);
     });
  }


function getDb() {
    return _db;
}
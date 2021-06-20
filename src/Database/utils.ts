import { DB, URL } from "./constants"
var MongoClient = require('mongodb').MongoClient;


export function insert(record, collection){
    MongoClient.connect(URL, function(err, db) {
        if (err) throw err;
        var dbo = db.db(DB);
        dbo.collection(collection).insertOne(record, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
        });
      });
}

export function fetch(collection, filter): any{
    MongoClient.connect(URL, function(err, db) {
        if (err) throw err;
        var dbo = db.db(DB);
        return dbo.collection(collection).find(filter, function(err, result) {
          if (err) throw err;
          db.close();
        });
      });
}
import { Command } from "commander";
const program = new Command();

program
    .requiredOption('-c, --collection <String>')

program.parse(process.argv);


const cName = String(program.opts().collection)

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("vesting");
    dbo.createCollection(cName, function(err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
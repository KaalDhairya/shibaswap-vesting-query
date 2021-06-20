import { Command } from "commander";
const program = new Command();

program
    .requiredOption('-d, --dbName <String>')

program.parse(process.argv);


const dbName = String(program.opts().dbName)

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"+dbName;

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});
import { DB, URL } from "./constants"
var MongoClient = require('mongodb').MongoClient;


export async function insert(record, collection){
    // MongoClient.connect(URL, function(err, db) {
    //     if (err) throw err;
    //     var dbo = db.db(DB);
    //     dbo.collection(collection).updateOne({week: record.week, account: record.account, rewardToken: record.rewardToken},{$set: record}, {upsert:true}, function(err, res) {
    //       if (err) throw err;
    //       // console.log("1 document inserted");
    //       db.close();
    //     });
    //   });
    const db = await MongoClient.connect(URL);
    var dbo = await db.db(DB);
    await dbo.collection(collection).updateOne({week: record.week, account: record.account, rewardToken: record.rewardToken},{$set: record}, {upsert:true})
    // console.log(result);
    await db.close();

}

export async function fetchAll(collection, filter, select={}): Promise<any>{
  const db = await MongoClient.connect(URL);
    var dbo = await db.db(DB);
    const result = await dbo.collection(collection).find(filter, { projection : select }).toArray()
    // console.log(result);
    await db.close();
    return result;
}

export async function fetchOne(collection, filter): Promise<any>{
    const db = await MongoClient.connect(URL);
    var dbo = await db.db(DB);
    const result = await dbo.collection(collection).findOne(filter)
    await db.close();
    return result;
}

// MongoClient.connect(URL, function(err, db) {
    //     if (err) throw err;
    //     var dbo = db.db(DB);
    //     console.log(filter)
    //     return dbo.collection(collection).findOne(filter, function(err, result) {
    //       if (err) throw err;
    //       console.log("reached at find")
    //       db.close();
    //       console.log("result",result)
    //       return result;
    //     });
    //   });
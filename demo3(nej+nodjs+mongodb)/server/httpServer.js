var http = require('http');
var URL = require('url');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/myproject';
var database = 'documents';

// HTTP 增查改删 数据解析
var p = {
    update: function(req, res, oldId, newTitle, completed) {
        // var oldId = 1111;
        var newObj = {
            "id": oldId, 
            "title": newTitle, 
            "completed": completed
        };
        MongoClient.connect(url, function(err, db) {
            console.log("Connected succesfully to server");
            m.mUpdate(db, database, function() {
                console.log(newObj);
                console.log('update successfully \n');
                db.close();
            }, newObj, oldId);
        });
        
        res.end('update \n');
    },
    updateAll: function(req, res, sign) {
        MongoClient.connect(url, function(err, db) {
            console.log("Connected succesfully to server");
            m.mUpdateAll(db, database, function() {
                console.log(sign);
                console.log('updateAll successfully \n');
                db.close();
            }, sign);
        });
        
        res.end('updateAll \n');
    },
    remove: function(req, res, oldId) {
        // var oldId = 12345;
        MongoClient.connect(url, function(err, db) {
            console.log("Connected succesfully to server");
            if (!oldId || oldId!=="all" ) {
                m.mDelete(db, database, function() {
                    console.log('delete successfully \n');
                    db.close();
                }, oldId);
            } else {
                m.mDeleteAll(db, database, function() {
                    console.log('delete successfully \n');
                    db.close();
                });
            }
            
        });
        
        res.end('remove \n');
    },
    create: function(req, res, newObj) {
        MongoClient.connect(url, function(err, db) {
            console.log("Connected succesfully to server");
            // var newObj = {
            //     "id": 12345,
            //     "title": "read a book",
            //     "completed": false
            // };
            m.mCreate(db, database, function() {
                console.log('create successfully \n');
                db.close();
            }, newObj);
        });
        res.end('create \n');
    },
    get: function(req, res, filter) {
        MongoClient.connect(url, function(err, db) {
            console.log("Connected succesfully to server");
            m.mGet(db, database, function() {
                console.log('get successfully \n');
                db.close();
            }, filter, res);
        });
        
    }
};
// 数据库 增查改删 方法
var m = {
    mGet: function(db, database, callback, filter, res) {
        if(!filter || filter === "all") {
            // Get the documents collection
          var collection = db.collection(database);
          // Find some documents
          collection.find({}).toArray(function(err, docs) {
            console.log(docs);
            res.end(JSON.stringify(docs));

            callback();
          });
        } else {
            // Get the documents collection
            var collection = db.collection(database);
            // Find some documents
            collection.find({"completed": filter==="completed"}).toArray(function(err, docs) {
                console.log(docs);
                res.write(docs);
                callback();
            });
        }
    },
    mCreate: function(db, database, callback, newObj) {
        // Get the documents collection
        var collection = db.collection(database);
        // Insert some documents
        collection.insertOne(newObj, function(err, result) {
            callback();
        });
    },
    mUpdate: function(db, database, callback, newObj, oldId) {
        // Get the documents collection
        var collection = db.collection(database);
        collection.updateOne({"id":oldId}, {$set: newObj}, function(err, result) {
            callback();
        });
    },
    mUpdateAll: function(db, database, callback, sign) {
        // Get the documents collection
        var collection = db.collection(database);
        collection.updateMany({"completed": !sign}, {$set: {"completed": sign}}, function(err, result) {
            callback();
        });
    },
    mDelete: function(db, database, callback, oldId) {
      // Get the documents collection
      var collection = db.collection(database);
      // Delete some documents
      console.log(oldId);
      collection.deleteOne({ "id" : oldId }, function(err, result) {
        callback(result);
      });    
    },
    mDeleteAll: function(db, database, callback) {
      // Get the documents collection
      var collection = db.collection(database);
      // Delete some documents
      collection.deleteMany({ "completed" : true }, function(err, result) {
        callback(result);
      });    
    },
};
var server = http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    switch(req.method) {
        case 'POST': 
            // {"oldId":id, "newObj": obj}
            var data = '';
            req.on('data', function(chunk){
                // 如果传输数据比较大，这里要做buffer拼接
                data += chunk;
            });
            req.on('end', function(){
                var params = JSON.parse(data.toString('utf-8'));
                if (params.newObj) {
                    var oldId = params.newObj.oldId;
                    var newTitle = params.newObj.title;
                    var completed = params.newObj.completed;
                    p.update(req, res, oldId, newTitle, completed);
                } else {
                    p.updateAll(req, res, params.sign);
                }
                
            });
            // p.update(req, res);
            break;

        case 'GET':
            var path = URL.parse(req.url);
            if(path.query) {
                p.get(req, res, path.query);
            } else {
                p.get(req, res);
            }
            break;

        case 'PUT':
            // {"newObj": obj}
            var data = '';
            req.on('data', function(chunk){
                // 如果传输数据比较大，这里要做buffer拼接
                data += chunk;
            });
            req.on('end', function(){
                var params = JSON.parse(data.toString('utf-8'));
                var newObj = params.newObj;
                p.create(req, res, newObj);
            });
            break;

        case 'DELETE':
            // {"oldId":id}
            var data = '';
            req.on('data', function(chunk){
                // 如果传输数据比较大，这里要做buffer拼接
                data += chunk;
            });
            req.on('end', function(){
                // var params = JSON.parse(data.toString('utf-8'));
                console.log("delete");
                console.log(data);
                var oldId = data;
                p.remove(req, res, oldId);
            });
            break;

        default:
            res.end("no method");
            break;
    }
});
server.listen(3000);

let mongo = require('mongodb');
const fs = require('fs');
let MongoClient = mongo.MongoClient;
const ObjectId = require('mongodb').ObjectId;
let db;
let gallery = [];

fs.readdir('artworks',(err,files) => {
    if(err)
        console.log(err);
    else{
        files.forEach(file=>{
            fs.readFile(`artworks/${file}`,'utf8',function(err,info){
                if(err) throw err;
                gallery = JSON.parse(info);
                for(let i = 0;i < gallery.length;i++){
                    gallery[i].likes = 0;
                    gallery[i].reviews = [];
                    gallery[i].likedBy = {};
                    gallery[i].reviewedBy={};
                }
            })
        })
    }
})


MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;

  db = client.db('a5');
  db.dropCollection("art", function(err, result){
	  if(err){
			console.log("Error dropping collection. Likely case: collection did not exist (don't worry unless you get other errors...)")
		}else{
				console.log("Cleared artwork collection.");
		}
        
		db.collection("art").insertMany(gallery, function(err, result){
			if(err) throw err;
			console.log(result);
            console.log("art added");
			process.exit();
		})
        
  });
});


//Create express app
const express = require('express');
const session = require('express-session');
let app = express();

//Database variables
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;
const ObjectId = require('mongodb').ObjectId;

//Session users
let users = {
};

let artists = {};

//Setting up session
app.use(session({ 
    secret: 'some secret here', 
    //cookie: {maxAge:50000},  //the cookie will expire in 50 seconds
    resave: true,
    saveUninitialized: true
  }));  // now we have req.session object
//View engine
app.set("view engine", "pug");

//Set up the routes
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/artist", auth, admin); // we authorize first. If success then we show admin page 
app.post("/login", login);      // send POST request to /login to login
app.get("/logout", logout);     // send GET request to /logout to logout

//All unique categories and mediums in the database
let categorie = [];
let medium = []

//Page count
let count = 0;

//authorization function
function auth(req, res, next) {
	//check if there a loggedin property set for the session, and
	//if they have admin rights
	if (!req.session.loggedin || !users[req.session.username].artist) {
		res.status(401).send("Unauthorized");
		return;
    }
	next();
}

function admin(req, res, next) {
	res.render("artistHome");
	return;
}

//If the username and password match somebody in our database,
// then create a new session ID and save it in the database.
//That session ID will be associated with the requesting user
function login(req, res, next) {
	if (req.session.loggedin) {
		res.status(200).send("Already logged in.");
		return;
	}

	let username = req.body.username;
	let password = req.body.password;

	console.log("Logging in with credentials:");
	console.log("Username: " + req.body.username);
	console.log("Password: " + req.body.password);

	//does the user exist?
	if (!users.hasOwnProperty(req.body.username)) {
		res.status(401).send("Unauthorized"); //you can also send 404 and specify "User not found"
		return;
	}

	//the user exists. Lets authenticate them
	if (users[req.body.username].password === req.body.password) {
		req.session.loggedin = true; // now that particular user session has loggedin value, and it is set to true 

		//We set the username associated with this session
		//On future requests, we KNOW who the user is
		//We can look up their information specifically
		//We can authorize based on who they are
		req.session.username = username; //we keep track of what user this session belongs to
		
		res.redirect(302,"http://localhost:3000/account");
		
	} else {
		res.status(401).send("Not authorized. Invalid password.");
	}
}

//Function to log user out
function logout(req, res, next) {
	if (req.session.loggedin) {
		req.session.loggedin = false;
		req.session.username = undefined;
		res.status(200).send("Logged out.");
	} else {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

//Home page
app.get("/", function(req,res){
	db.collection("art").distinct("artist",function(err,results){
		if (err) throw err;
		//If artists object is not initialized, initialize it
		if(Object.keys(artists).length == 0){
			for (let i = 0; i < results.length;i++){
				artists[results[i]] = {workshops:[], followers:[]}
			}
		}
		res.render('home');
	});
});

//Artworks page/search page
app.get("/artworks",function(req,res){
	//Not logged in
	if (!req.session.loggedin) {
		res.redirect(302,"http://localhost:3000/account");
		return;
	}
	db.collection("art").distinct("category",function(err,categories){
		if(err) throw err;
		if(categories){
			db.collection("art").distinct("medium",function(err,mediums){
				if(err) throw err;
				if(mediums){
					//Finding all unique categories and mediums
					categorie = categories;
					medium = mediums;
					res.render('artHome', {items:users[req.session.username].search,categories: categories,mediums:mediums,count:count})
				}
			});
		}
	});
});

//Specific artwork
app.get("/artworks/:id",function(req,res){
	//Getting _id
	let oid;
	try{
		oid = new ObjectId(req.params.id);
	}catch{
	    res.status(404).send("That ID does not exist.");
	    return;
	}
	//Matching artwork to id
	db.collection("art").findOne({"_id": oid}, function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		if(!result){
			res.status(404).send("That ID does not exist in the database.");
			return;
		}
		res.status(200).render("piece", {art: result,categories : categorie, mediums : medium,session:req.session});
	});
});

//Specific artist
app.get("/artists/:artist",function(req,res){
	let artist = req.params.artist;
	//Finding all artist's artwork
	db.collection("art").find({artist:artist}).toArray(function(err,result){
		if(err) throw err
		res.render("artist",{artwork:result,artist:artists[artist],name:artist,session:req.session});
	});
});

//Account page
app.get("/account",function(req,res){
	//If not logged in, prompt log in
	if(!req.session.loggedin) res.render("login",{users:users});
	//If the user is a new artist, prompt for artwork
	else if(users[req.session.username].hasOwnProperty("new")){
		delete users[req.session.username].new;
		res.redirect(302,"http://localhost:3000/artist/addArt");
	}
	//Otherwise, load all account information
    else {
		//Getting all liked artwork
		var query = {};
		query['likedBy.' + req.session.username] = {$exists:true};
		db.collection("art").find(query).toArray(function(err,likes){
			if(err) throw err;
			//Updating session info
			users[req.session.username].liked = likes;
			delete query['likedBy.' + req.session.username];

			//Getting all reviewed artwork
			query['reviewedBy.' + req.session.username] = {$exists:true};
			db.collection("art").find(query).toArray(function(err,reviewed){
				if(err) throw err;
				//Updating session info
				users[req.session.username].reviews = reviewed;
				res.render("account",{artists:artists,session:req.session,user:users[req.session.username]});
			});
		});
	}
});

//Register new user account
app.post("/register",register);

function register(req, res, next) {
	//Initializing all user data, should all be empty
	let obj = {};
	obj.password = req.body.password;
	obj.artist = false;
	obj.following = [];
	obj.liked = [];
	obj.reviews = [];
	obj.notifications=[];
	obj.search=[];

	console.log("Registering with credentials:");
	console.log("Username: " + req.body.name);
	console.log("Password: " + req.body.password);

	users[req.body.name] = obj;
	res.redirect(302,'http://localhost:3000/account');
}

//Toggling between artist and patron mode
app.post("/artistMode",function(req,res){
	if(users[req.session.username].artist) users[req.session.username].artist = false;
	else {
		users[req.session.username].artist = true;
		//If user is first time artist, set status to new (will prompt for artwork)
		if(!artists.hasOwnProperty(req.session.username)) {
			users[req.session.username].artist = false;
			users[req.session.username].new = true;
		}
	}
});

//Unfollow an artist
app.post("/unfollow",function(req,res){
	let artist = req.body.artist;
	//Removing from user following
	users[req.session.username].following.splice(users[req.session.username].following.indexOf(artist),1);
	//Removing user from artist followers
	artists[artist].followers.splice(artists[artist].followers.indexOf(req.session.username),1);
	//Console log to double check
	console.log("Now following " + users[req.session.username].following);
});

//Next 10 items in search page
app.post('/next',function(req,res){
	//Only allow going next if there are items to be displayed
	if((count*10+10) > users[req.session.username].search.length);
	else count++;
	db.collection("art").find({}).toArray(function(err, searchResult) {
		if (err) throw err;
		res.render('artHome', {items: searchResult,categories: categorie,mediums:medium,count:count});
	});
});

//Previous 10 items in search page
app.post('/prev',function(req,res){
	//If at the beginning of list, do not allow going past start
	if(count == 0);
	else count--;
	db.collection("art").find({}).toArray(function(err, searchResult) {
		if (err) throw err;
		res.render('artHome', {items: searchResult,categories: categorie,mediums:medium,count:count})
	})
});

//Updating artwork likes
app.put('/like',function(req,res){
	//Getting id
	let id = req.body.id;	
	let oid;
	try{
		oid = new ObjectId(id);
	}catch{
		res.status(404).send("That ID does not exist.");
		return;
	}
	//Matching artwork to id
	db.collection("art").findOne({"_id": oid}, function(err, result){
		if(err) throw err;
		//If artwork not liked by user already
		if(!(result.likedBy[req.session.username])){
			//Add a like
			let x = result.likes + 1;
			//Track the user
			result.likedBy[req.session.username] = true;
			let liked = result.likedBy;
			//Update database
			db.collection("art").updateOne({"_id": oid}, {$set:{likes: x,likedBy:liked}});
		}
		else{
			//If artwork has existing like by user
			console.log("Exists");
			//Remove like
			let x = result.likes - 1;
			//Update user tracker accordingly
			delete result.likedBy[req.session.username];
			let liked = result.likedBy;
			//update database
			db.collection("art").updateOne({"_id": oid}, {$set:{likes: x,likedBy:liked}});
		}
	});
})

//Create new review
app.post("/review",function(req,res){
	//Finding id
	let id = req.body.id;	
	let review = {};
	review.text = req.body.text;
	review.user = req.body.user;

	let oid;
	try{
		oid = new ObjectId(id);
	}catch{
		res.status(404).send("That ID does not exist.");
		return;
	}
	//Matching artwork to id
	db.collection("art").findOne({"_id": oid}, function(err, result){
		if(err) throw err;
		//Add the review info
		result.reviews.push(review);
		//Track the user
		let reviewed = result.reviews;
		result.reviewedBy[req.session.username] = true;
		let reviewedB = result.reviewedBy;
		//update database accordingly
		db.collection("art").updateOne({"_id": oid}, {$set:{reviews: reviewed,reviewedBy:reviewedB}});
	});
});

//Remove a review
app.put("/reviews",function(req,res){
	//Getting id
    let id = req.body.id;
	let rev = {}
	rev.text = req.body.text;
	rev.user = req.body.user;
	let oid;
	try{
		oid = new ObjectId(id);
	}catch{
		res.status(404).send("That ID does not exist.");
		return;
	}
	//Matching artwork with id
	db.collection("art").findOne({"_id": oid}, function(err, result){
		if(err) throw err;
		//Removing review from artwork
		result.reviews.splice((result.reviews.map(object=> object.text).indexOf(rev.text)),1);
		//If artwork has no more reviews from user, remove user from tracking
		if((result.reviews.map(object=> object.user).indexOf(rev.user)== -1)) delete result.reviewedBy[req.session.username];
		let x = [];
		let reviewedB = result.reviewedBy;
		x = result.reviews
		//update database
		db.collection("art").updateOne({"_id": oid}, {$set:{reviews: x,reviewedBy:reviewedB}});
	});
});

//Clear all reviews from user
app.put("/clearRev",function(req,res){
	//Getting artwork id
	user = req.body.user;
	id = req.body.id;
	let oid;
	try{
		oid = new ObjectId(id);
	}catch{
		res.status(404).send("That ID does not exist.");
		return;
	}
	//Matching artwork with id
	db.collection("art").findOne({"_id": oid}, function(err, result){
		if(err) throw err;
		//Removing all reviews from user
		while(result.reviews.map(object=> object.user).indexOf(user)!= -1){
			result.reviews.splice((result.reviews.map(object=> object.user).indexOf(user)),1);
		}
		let x = [];
		x = result.reviews
		delete result.reviewedBy[req.session.username];
		let reviewedB = result.reviewedBy;
		//Updating database accordingly
		db.collection("art").updateOne({"_id": oid}, {$set:{reviews: x,reviewedBy:reviewedB}});
	});
});

//Follow an artist
app.post("/follow",function(req,res){
	let artistName = req.body.artist;
	let user = req.body.user;
	
	//If user is not following artist already, otherwise do nothing
	if(users[req.session.username].following.indexOf(artistName) == -1){
		//Update user following
		users[req.session.username].following.push(artistName);
		//Update artist followers
		artists[artistName].followers.push(user);
	}
});

//Add artwork page
app.get("/artist/addArt",function(req,res){
	res.render("addArtwork",{session:req.session});
});

//Adding the artwork to database
app.post("/artworks",function(req,res){
	//Initializing art data
	let piece = {};
	piece = req.body;
	piece.likes = 0;
	piece.reviews = [];
	piece.likedBy={};
	piece.reviewedBy={};
	
	//Inserting to database
	db.collection("art").insertOne(piece, function(err, result){
		if(err) throw err;
		console.log("art added");
		//Initializing artist portion of user data
		users[req.session.username].artist = true;
		if(!artists.hasOwnProperty(req.session.username)) artists[req.session.username] = {workshops:[], followers:[]};
	})
	//Sending notification to followers
	if(artists.hasOwnProperty(req.session.username)){
		for(let i = 0; i < artists[piece.artist].followers.length;i++){
			users[artists[piece.artist].followers[i]].notifications.push("New art drop by " + piece.artist);
		}
	}
});

//Add a workshop page
app.get("/artist/addWorkshop",function(req,res){res.render("addworkshop",{session:req.session});});

//Adding a workshop to profile
app.post("/workshops",function(req,res){
	//Initializing workshop data
	let workshop = {};
	workshop = req.body;
	workshop.enrolled = [];
	//Adding workshop to profile
	artists[req.session.username].workshops.push(workshop);
	//Sending notification to followers
	for(let i = 0; i < artists[workshop.artist].followers.length;i++){
		users[artists[workshop.artist].followers[i]].notifications.push("New workshop by " + workshop.artist);
	}
});

//Specific artist workshop
app.get("/artist/:artist/:name",function(req,res){
	let workshopName = req.params.name;
	let artist = req.params.artist;
	let workshop = {};
	//Finding corresponding workshop
	for(let i = 0; i < artists[artist].workshops.length; i++){
		if (artists[artist].workshops[i].name == workshopName) workshop = artists[artist].workshops[i];
	}
	res.render("workshop",{workshop: workshop});
});

//Enroll for artist workshop
app.post("/enroll",function(req,res){
	let info = req.body;
	//let event = {};
	//Find corresponding workshop
	for(let i = 0; i < artists[info.artist].workshops.length; i++){
		if (artists[info.artist].workshops[i].name == info.workshop) event = artists[info.artist].workshops[i];
	}
	//Add to enroll list
	artists[info.artist].workshops[artists[info.artist].workshops.map(object=> object.name).indexOf(info.workshop)].enrolled.push(info.name);
});

//Search artworks
app.post("/search",function(req,res){
	//Creating search query
	let query = {};

	if(req.body.art){
        query["name"] = req.body.art;
    }
    if(req.body.artist){
        query["artist"] = req.body.artist;
    }
	if(req.body.category){
        query["category"] = req.body.category;
    }
	//Matching artwork to search query
	db.collection("art").find(query).toArray(function(err,results){
		if(err) throw err;
		//Updating search data
		users[req.session.username].search = results;
		count = 0;
		res.json(users[req.session.username].search);
	});
});

//Clear all notifications
app.post("/clearNotifs",function(req,res){
	users[req.session.username].notifications.splice(0,users[req.session.username].notifications.length);
});

//Send search results for specified category
app.get("/artworks/categories/:category",function(req,res){
	let category = req.params.category;
	//Finding all artworks by category
	db.collection("art").find({category:category}).toArray(function(err, searchResult) {
		//Updating search data
		if (err) throw err;
		users[req.session.username].search = searchResult;
		count = 0;
		//Sending user to updated search page
		res.redirect(302,'http://localhost:3000/artworks');
	});
});

//Send search results for specified medium
app.get("/artworks/mediums/:medium",function(req,res){
	let medium = req.params.medium;
	db.collection("art").find({medium:medium}).toArray(function(err, searchResult) {
		//Updating search data
		if (err) throw err;
		users[req.session.username].search = searchResult;
		count = 0;
		//Sending user to updated search page
		res.redirect(302,'http://localhost:3000/artworks');
	});
});

// Initialize database connection
MongoClient.connect("mongodb://127.0.0.1:27017/", { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;

  //Get the a4 database
  db = client.db('a5');

  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});

function register(users) {
   let account = {};
   account.name = document.getElementById("username").value;
   account.password = document.getElementById("password").value;

   if(users.hasOwnProperty(account.name)){
      alert("Username must be unique");
      return;
   }

   users[account.name] = account;
   
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("POST", "/register")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(account))
   alert("Account registered!");
}

function logout(){
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("GET", "logout")
   location.replace("/");
   alert("Logged out!");
   xhttp.send()
}

function artistMode(artists,session){
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("POST", "/artistMode")
   alert("Artist mode toggled!");
   setTimeout(location.replace("/account"),2000);
   xhttp.send()
}

function unfollow(id){
   let ids = {}
   ids.artist = id;
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("POST", "/unfollow")
   xhttp.setRequestHeader("Content-Type", "application/json");
   alert("Artist unfollowed!");
   location.replace("/account");
   xhttp.send(JSON.stringify(ids))
}

function like(id,session,piece){
   if(!session.loggedin) {
      location.replace("/account");
      alert("Cannot like, not logged in");
      return;
   }

   ids={};
   ids.id = id;
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("PUT", "/like")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(ids))
   location.replace("/artworks/" + id);
   if(piece.likedBy.hasOwnProperty(session.username)) alert("Artpiece unliked :(");
   else alert("Artpiece liked!");
}

function review(id,session){
   if(!session.loggedin) {
      location.replace("/account");
      alert("Cannot review, not logged in");
      return;
   }

   let review = {};
   review.text = document.getElementById(id).value;
   review.id = id;
   review.user = session.username;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("POST", "/review")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(review))
   alert("Review added!");
   location.replace("/artworks/" + id);
}

function delRev(piece,review,session){
   rev = {};
   rev.id = piece._id;
   rev.text = review;
   rev.user = session.username;

   let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			console.log("success");
		}
	}
	xhttp.open("PUT", "/reviews");
   xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(rev));  
   alert("Review deleted successfully.");
   location.replace("/artworks/" + piece._id);
}

function unlike(id){
   ids={};
   ids.id = id;
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("PUT", "/like")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(ids))
   alert("Artpiece unliked :(");
   location.replace("/account");
}

function clearRev(piece,session){
   let info = {};
   info.id = piece;
   info.user = session.username;

   let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
			console.log("success");
		}
	}
	xhttp.open("PUT", "/clearRev");
   xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify(info));  
   alert("Reviews cleared successfully.");
   location.replace("/account");
}

function follow(artist,session){
   if(!session.loggedin) {
      location.replace("/account");
      alert("Cannot follow, not logged in");
      return;
   }

   let follow = {};
   follow.artist = artist;
   follow.user = session.username;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("POST", "/follow")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(follow));
   alert("Artist followed!");
}

function enroll(workshop,session){
   if(!session.loggedin) {
      location.replace("/account");
      alert("Cannot enroll, not logged in");
      return;
   }

   let info = {};
   info.name = session.username;
   info.artist = artist;
   info.workshop = workshop;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("POST", "/enroll")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(info));
   alert("Enrolled!");
}

function clearNotifs(){
   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
          console.log("success");
       }
   }
   xhttp.open("POST", "/clearNotifs")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send();
   alert("Notifications cleared!");
   location.replace("/account");

}
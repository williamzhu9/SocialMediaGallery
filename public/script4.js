window.addEventListener('load', (event) => {
    document.getElementById("search").addEventListener("click", function(event) {
        fsend();
    });
});

function fsend() {
    let query = {};
    query.art = document.getElementById("artworkName").value;
    query.artist = document.getElementById("artistName").value;
    query.category = document.getElementById("category").value;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("POST", "/search")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(query))
   location.replace("localhost:3000/artworks");
   alert("Searching...returning results");
}
 
function prev(){
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           console.log("success");
        }
    }
    xhttp.open("POST", "/prev")
    location.replace("/artworks");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send()
 }
 
 function next(){
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
           console.log("success");
        }
    }
    xhttp.open("POST", "/next")
    location.replace("/artworks");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send()
 }
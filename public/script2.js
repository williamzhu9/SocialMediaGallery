window.addEventListener('load', (event) => {
    document.getElementById("upload").addEventListener("click", function(event) {
        if(checkForm() == 1) event.preventDefault();
        else {
         fsend();
         alert("Artpiece uploaded successfully");
        }
    });
});

function fsend() {
    let piece = {};
    piece.name = document.getElementById("name").value;
    piece.artist = session.username;
    piece.category = document.getElementById("category").value;
    piece.year = document.getElementById("year").value;
    piece.description = document.getElementById("desc").value;
    piece.medium = document.getElementById("medium").value;
    piece.image = document.getElementById("source").value;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("POST", "/artworks")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(piece))
}

function checkForm() {
    // TODO: Perform input validation 
    let error = [];
    const isNum = /^\d*\.?\d+$/;
    const word = /^[a-zA-z]+$/;
    let result = "";
    let rc = 0;

    let test = document.getElementById("year").value;
    error[0] = isNum.test(test);
 
    test = document.getElementById("category").value;
    error[1] = word.test(test);
    
    test = document.getElementById("medium").value;
    error[2] = word.test(test);
 
    document.getElementById("errors").classList.add("hide");
    if(error[0] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Year input is not a number </li>`;
       rc = 1;
    }
 
    if(error[1] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Category input is not a word </li>`;
       rc = 1;
    }
    
    if(error[2] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Medium input is not a word </li>`;
       rc = 1;
    }
    document.getElementById("errors").innerHTML = result;
    return rc;
 }
 

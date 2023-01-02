window.addEventListener('load', (event) => {
    document.getElementById("add").addEventListener("click", function(event) {
        if(checkForm() == 1) event.preventDefault();
        else {
         fsend();
         alert("Workshop uploaded successfully");
        }
    });
});

function fsend() {
    let workshop = {};
    workshop.name = document.getElementById("name").value;
    workshop.date = document.getElementById("date").value;
    workshop.time = document.getElementById("time").value;
    workshop.artist = session.username;

   let xhttp = new XMLHttpRequest()
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         console.log("success");
      }
   }
   xhttp.open("POST", "/workshops")
   xhttp.setRequestHeader("Content-Type", "application/json");
   xhttp.send(JSON.stringify(workshop))
}

function checkForm() {
    // TODO: Perform input validation 
    let error = [];
    const time = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$/;
    const date = /^\d{2}\/\d{2}\/\d{4}$/;
    const word = /^[a-z A-z]+$/;
    let result = "";
    let rc = 0;

    let test = document.getElementById("date").value;
    error[0] = date.test(test);
 
    test = document.getElementById("time").value;
    error[1] = time.test(test);
    
    test = document.getElementById("name").value;
    error[2] = word.test(test);
 
    document.getElementById("errors").classList.add("hide");
    if(error[0] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Date input must be of dd/mm/yyyy format, ex: 11/11/1111 </li>`;
       rc = 1;
    }
 
    if(error[1] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Time input must be of 24hr format, ex: 23:59 </li>`;
       rc = 1;
    }
    
    if(error[2] == false){
       document.getElementById("errors").classList.remove("hide");
       result += `<li> Name input is not a word </li>`;
       rc = 1;
    }
    document.getElementById("errors").innerHTML = result;
    return rc;
 }
 

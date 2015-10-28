/**
 * Created by Shaquille on 15/09/2015.
 */

function toggleImg(state) {
    if (state === "off") {
        document.getElementById("light").src = "/lighton.png";
        console.log(state);
    } else if(state === "on") {
        document.getElementById("light").src = "/lightoff.png";
    }
    console.log(state);
    console.log("1");


    /*
     var state = "off";



     if (state === "off") {
     //document.getElementById("light").src = "/lightoff.png";
     } else {
     document.getElementById("light").src = "/lighton.png";
     }


     */
}
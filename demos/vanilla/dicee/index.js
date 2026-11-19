var randomNum1 = Math.floor(Math.random() * 6) + 1; // Random 1-6
var randomNum2 = Math.floor(Math.random() * 6) + 1;

// img/dice1.png - img/dice6.png
document.querySelector(".img1").setAttribute("src", "img/dice" + randomNum1 + ".png"); // Player's dice 1
document.querySelector(".img2").setAttribute("src", "img/dice" + randomNum2 + ".png"); // Player's dice 2

var h1 = document.querySelector("h1");

if (randomNum1 > randomNum2) {
  h1.innerHTML = "🚩 Player 1 Wins!"
} else if (randomNum2 > randomNum1) {
  h1.innerHTML = "Player 2 Wins! 🚩"
} else {
  h1.innerHTML = "Draw!";
}
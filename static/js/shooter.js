// an endless shooter game in a browser

// global variables
var player;
var score = 0;
var lives = 3;
var level = 1;
var levelUp = 0;
var levelUpScore = 100;
var playfield = document.getElementsByClassName("playfield");

// game loop
function gameLoop() {
    // press start to start the game
    if (lives > 0) {
        update();
    } else {
        gameOver();
    }

    spawnEnemy();
    update();
}

// update game
function update() {
    drawScore();
    drawLives();
    drawLevel();
    showTop3Players();
}

// draw score
function drawScore() {
    // if the scores is not the same as the score inside the text in the scoreValue span, change the text inside it to the new score
    console.log(score + "\n" + document.getElementById("scoreValue").innerHTML);
    if (score != document.getElementById("scoreValue").innerHTML) {
        document.getElementById("scoreValue").innerHTML = score;
    }
}

// draw lives
function drawLives() {
    document.getElementById("livesValue").innerHTML = lives;
}

// +1 score
function scoreUpdate() {
    score++
    drawScore();
}

// +1 life
function livesUpdate() {
    lives++
    drawScore();
}

// make the player ask for a username and use that username to save the score in the local storage
function saveScore() {
    var username = prompt("Please enter your username to save your scores to our database:");
    if (username !== null || username !== "") {
        var scoreData = {
            "username": username,
            "score": score
        };
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/scores", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(scoreData));
    }
    else {
        alert("You did not enter a username, so your score will not be saved.");
    }
}

//  when the player is dead
function gameOver() {
    alert("Game over! Your score is " + score);
    saveScore();
    playAgain();
}

function playAgain() {
    lives = 3;
    score = 0;
    drawLives();
    drawScore();
    let playagain = prompt("Do you want to play again? (yes/no)");
    if (playagain == "yes") {
        gameLoop();
    }
    else {
        alert("Thank you for playing!\nIf you want to give feedback, please send an email to: dis.commander.r@gmail.com");
    }
}

//  player gets damaged
function damage() {
    lives--;
    drawLives();
    if (lives <= 0) {
        gameOver();
    }
}

// show the top player with score from the database
function showTop3Players() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var topPlayer = JSON.parse(this.responseText);

            // change the display of the top3players div to relative instead of none
            document.getElementById("top3players").style.display = "relative";


            // see if the table has more then 1 tr, if so remove all but the first tr
            var table = document.getElementById("top3players");
            if (table.rows.length > 1) {
                for (var i = table.rows.length - 1; i > 0; i--) {
                    table.deleteRow(i);
                }
            }

            if(topPlayer.length == 0) {
                var row = document.createElement("tr");
                var username = document.createElement("td");
                var score = document.createElement("td");
                username.innerHTML = "No players yet";
                score.innerHTML = "No scores yet";
                row.appendChild(username);
                row.appendChild(score);
                
                document.getElementById("top3players").appendChild(row);
            }

            // place each player in the table
            for (var i = 0; i < topPlayer.length; i++) {
                var row = document.createElement("tr");
                var username = document.createElement("td");
                var score = document.createElement("td");
                username.innerHTML = topPlayer[i].username;
                score.innerHTML = topPlayer[i].score;
                row.appendChild(username);
                row.appendChild(score);
                
                document.getElementById("top3players").appendChild(row);
            }
        }
    };
    xhttp.open("GET", "/top3players", true);
    xhttp.send();
}


var myGamePiece;
var myObstacles = [];
var lives = 3;
var score;
var level = 1;
var paused = false;
var gamespeed = 20;

function startGame() {
    myGamePiece = new component(30, 30, "lime", 10, 120);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 800;
        this.canvas.height = 550;
        this.context = this.canvas.getContext("2d");
        document.getElementById("game").insertBefore(this.canvas, document.getElementById("game").childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, gamespeed);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        saveScore();
        clearInterval(this.interval);
    },
    pause : function() {
        if (!paused) {
            clearInterval(this.interval);
            paused = true;
            togglePauseMenu();
        }
        else {
            this.interval = setInterval(updateGameArea, gamespeed);
            paused = false;
            togglePauseMenu();
        }
    },
    restart : function() {
        this.clear();
        myObstacles = [];
        lives = 3;
        score = 0;
        level = 1;
        document.getElementsByClassName("livesValue").innerHTML = lives;
        document.getElementsByClassName("scoreValue").innerHTML = score;
        document.getElementsByClassName("levelValue").innerHTML = level;
        this.start();
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }    
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function drawLives() {
    let liveDivs = document.getElementsByClassName("livesValue");
    for (let i = 0; i < liveDivs.length; i++) {
        liveDivs[i].innerText = lives;
    }
}

function drawLevel() {
    let levelDivs = document.getElementsByClassName("levelValue");
    for (let i = 0; i < levelDivs.length; i++) {
        levelDivs[i].innerText = level;
    }
}

// level up when score is a multiple of 1000
function levelUp() {
    if (score % 1000 == 0) {
        level++;
        drawLevel();
    }
    // increase game speed every 1000 points
    if (score % 1000 == 0 && gamespeed > 1) {
        gamespeed -= 4;
        clearInterval(myGameArea.interval);
        myGameArea.interval = setInterval(updateGameArea, gamespeed);
    }

    // change every 100 points the background of the game area
    if (score % 1000 == 0) {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        let color = "rgb(" + r + "," + g + "," + b + ")";
        myGameArea.canvas.style.backgroundColor = color;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            lives -= 1;
            if (lives == 0) {
                myGameArea.stop();
                playAgain();
            }
            myObstacles.splice(i, 1);
            drawLives();
            showTop3Players();
            return;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "rgba(121, 5, 199, 0.863)", x, 0));
        myObstacles.push(new component(10, x - height - gap, "rgba(121, 5, 199, 0.863)", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    score = myGameArea.frameNo / 10;
    drawScore();
    levelUp();
    myGamePiece.newPos();    
    myGamePiece.update();
}

function drawScore() {
    if (score != document.getElementsByClassName("scoreValue")[0].innerHTML) {
        // for every 500 points, add a life
        if (score % 500 == 0) {
            lives++;
            drawLives();
        }
        var scoreDivs = document.getElementsByClassName("scoreValue");
        for (let i = 0; i < scoreDivs.length; i++) {
            scoreDivs[i].innerText = score;
        }
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function moveup() {
    myGamePiece.speedY = -2; 
}

function movedown() {
    myGamePiece.speedY = 2; 
}

function clearmove() {
    myGamePiece.speedX = 0; 
    myGamePiece.speedY = 0; 
}

function saveScore() {
    var username = prompt("Please enter your username to save your scores to our database:");
    if (username == null || username == "") {
        alert("You did not enter a username, so your score will not be saved.");
    }
    else {
        var scoreData = {
            "username": username,
            "score": score,
            "level": level
        };
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/scores", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(scoreData));
    }
}


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
                var level = document.createElement("td");
                username.innerHTML = "No data yet";
                score.innerHTML = "No data yet";
                level.innerHTML = "No data yet";
                row.appendChild(username);
                row.appendChild(score);
                row.appendChild(level);
                
                document.getElementById("top3players").appendChild(row);
            }

            // place each player in the table
            for (var i = 0; i < topPlayer.length; i++) {
                var row = document.createElement("tr");
                var username = document.createElement("td");
                var score = document.createElement("td");
                var level = document.createElement("td");
                username.innerHTML = topPlayer[i].username;
                score.innerHTML = topPlayer[i].score;
                level.innerHTML = topPlayer[i].level;
                row.appendChild(username);
                row.appendChild(score);
                row.appendChild(level);
                
                document.getElementById("top3players").appendChild(row);
            }
        }
    };
    xhttp.open("GET", "/top3players", true);
    xhttp.send();
}

function playAgain() {
    drawLives();
    drawScore();
    let playagain = prompt("Do you want to play again? (yes/no)");
    if (playagain == "yes") {
        lives = 3;
        score = 0;
        myObstacles = [];
        myGameArea.frameNo = 0;
        showTop3Players();
        myGameArea.start();
    }
    else {
        alert("Thank you for playing!\nIf you want to give feedback, please send an email to: dis.commander.r@gmail.com");
        lives = 3;
        score = 0;
        showTop3Players();
        document.getElementById("playagain").style.display = "block";
    }
}

function startGame2() {
    document.getElementById("playagain").style.display = "none";
    lives = 3;
    score = 0;
    myObstacles = [];
    myGameArea.frameNo = 0;
    myGamePiece = new component(30, 30, "yellow", 10, 120);
    myGameArea.start();
}

document.onkeydown = function (e) {
    switch (e.keyCode) {
        case 87:
            moveup();
            break;
        case 83:
            movedown();
            break;
        case 27:
            pauseGame();
            break;
        case 81:
            quitGame();
            break;
        case 82:
            restartGame();
            break;
    }
}

document.onkeyup = function (e) {
    clearmove();
}

// function pause the game
function pauseGame() {
    myGameArea.pause();
}

function togglePauseMenu() {
    drawScore();
    drawLives();
    drawLevel();

    var x = document.getElementById("pauseMenu");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function restartGame() {
    window.location.reload();
}

function quitGame() {
    lives = 3;
    score = 0;
    myObstacles = [];
    myGameArea.stop();
    showTop3Players();
    document.getElementById("playagain").style.display = "block";
}

function controls() {
    alert("Controls:\nW: Move up\nS: Move down\nESC: Pause/Resume the game\nR: Restart the game\nQ: Quit the game");
}

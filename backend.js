const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(express.static('static'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.post("/scores", (req, res) => {
    // get the data from the request
    var FetchedData = req.body;
    // read the scores.json file
    fs.readFile(__dirname + '/scores.json', 'utf8', (err, data) => {
        if(err) {
            console.log(err);
        }
        else {
            // read the scores.json file// write the new data to data.json
            let jsonData = fs.readFileSync('scores.json');
            let dataRecord = JSON.parse(jsonData);
            
            const username = FetchedData.username;
            const score = FetchedData.score;
            const lives = FetchedData.lives;

            if(username === "" || username === null) return;

            if(dataRecord.data.length >= 10) {
                // sort the scores
                dataRecord.data.sort((a, b) => (a.score > b.score) ? 1 : -1);
                // remove the lowest score
                dataRecord.data.pop();
            }

            // add the new scores to the dataRecord
            dataRecord.data.push({ "username": username, "score": score });

            // add the new score to the scores.json file
            let newData = JSON.stringify(dataRecord);
            fs.writeFileSync('scores.json', newData);
        }
    });
    res.send("Score saved!");
});

app.get('/top3players', async (req, res) => {
    fs.readFile(__dirname + '/scores.json', 'utf8', (err, data) => {
        if(err) {
            console.log(err);
        }
        else {
            // read the scores.json file
            let jsonData = fs.readFileSync('scores.json');
            let dataRecord = JSON.parse(jsonData);
            // find 3 users with the highest score
            dataRecord.data.sort((a, b) => (a.score > b.score) ? -1 : 1);
            // create an array with the top 3 users
            let top3 = dataRecord.data.slice(0, 3);
            // send the top3 array to the client
            res.send(top3);
        }
    });

});

app.listen(port, () => console.log(`Web app listening at http://localhost:${port}`));
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

// Create app
const app = express();

// Add static content
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

const options = {
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.crt'),
    requestCert: false,
    rejectUnauthorized: false
};

var server = https.createServer(options, app).listen(3000, function(){
    console.log("Server is ready to rocks !!!!");
    console.log("https://localhost:3000");
});
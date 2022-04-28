const express = require("express");
var fs = require('fs');
var csv = require('csv-parser');

let mongoose = require('mongoose');
mongoose.connect(
    'mongodb://localhost:27017/jsonData',
    { useUnifiedTopology: true, useNewUrlParser: true }
);
const Schema = new mongoose.Schema({
    id: Number,
    name: String,
    city: String,
    age: Number
})
const JsonData = new mongoose.model("JsonData", Schema)

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname)
    }
})
const upload = multer({ storage: storage });

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.post('/', upload.single('csvfile'), function (req, res) {
    res.redirect('/');
    var arr = [];
    fs.createReadStream('csvfile').pipe(csv({})).on('data', function (data) {
        arr.push(data);
    }).on('end', () => {
        JsonData.insertMany(arr, function (err, jsonData) {
            if (err) {
              console.log(err);
            };
            console.log(jsonData);
          });
    });
})

app.listen(3000, () => {
    console.log(`App listening on port 3000`)
})
const express = require("express");
var fs = require('fs');
var csv = require('csv-parser');

let mongoose = require('mongoose');
mongoose.connect(
    'mongodb://localhost:27017/jsonData',
    { useUnifiedTopology: true, useNewUrlParser: true }
);

const SchemaA = new mongoose.Schema({
    text: String,
    email: String,
    number: Number,
    url: String
})
const SchemaB = new mongoose.Schema({
    id: Number,
    name: String,
    city: String,
    age: Number
})
const CollectionA = new mongoose.model("Collection_a", SchemaA)
const CollectionB = new mongoose.model("Collection_b", SchemaB)

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
    const data = new CollectionA({
        text: req.body.text,
        email: req.body.email,
        number: req.body.number,
        url: 'https://my-bucket.s3-us-west-2.amazonaws.com'
    });
    data.save();
    res.redirect('/');
    var arr = [];
    fs.createReadStream('csvfile').pipe(csv({})).on('data', function (data) {
        arr.push(data);
    }).on('end', () => {
        CollectionB.insertMany(arr, function (err, jsonData) {
            if (err) {
                console.log(err);
            };
            console.log(jsonData);
        });
    });
})

app.listen(3000, () => {
    console.log('App listening on port 3000')
})

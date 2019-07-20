var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/map", function(req, res){
    res.render("map");
});

app.listen(3000, "localhost", function(){
    console.log("Buffalo Mountain server has started!");
});

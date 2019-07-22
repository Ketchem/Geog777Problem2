var express = require('express'),
    bodyParser = require('body-parser'), 
    app = express();


const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:admin@192.168.86.120:5432/ParkApp'
    
const pool = new Pool({
      connectionString: connectionString,
    });

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/map", function(req, res){
    pool.query('SELECT trailid, name, description, length, difficulty, type, parkid, ST_AsGeoJSON(geom) as geometry FROM trail', (err, trails) => {
        if (err) {
          throw err
        }
        else {
            // console.log(trails.rows)
            res.render("map", {trails:trails.rows});
        }
    });
});

app.listen(3000, "localhost", function(){
    console.log("Buffalo Mountain server has started!");
});

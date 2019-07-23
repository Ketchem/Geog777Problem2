var express = require('express'),
    bodyParser = require('body-parser'), 
    app = express(), 
    http = require('http');


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
    res.render("map");
});

app.get("/reviews/:id", function(req, res){
    res.render("reviews", {trailid:req.params.id});
});

app.get("/api/getReviews/:id", function(req, res){
    // console.log(req.params.id);
    queryString = "";
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(req.params.id));
});

app.get("/api/getTrails", function(req, res){
    pool.query('SELECT trailid, name, description, length, difficulty, type, parkid, ST_AsGeoJSON(geom) as geometry FROM trail', (err, trails) => {
        if (err) {
          throw err
        }
        else {
            var sendData = [];
            trails.rows.forEach(function(trail){
                var reviewURL = "/reviews/" + trail.trailid.toString();
                var popupContent = "<p>" + trail.name + "</p></br><a href='" + reviewURL + "'>Reviews</a>"
                // console.log (popupContent);

                var data = {
                    type: "Feature",
                    properties: {
                        trailid: trail.trailid,
                        name: trail.name,
                        description: trail.description,
                        length: trail.length,
                        difficulty: trail.difficulty,
                        type: trail.type,
                        parkid: trail.parkid,
                        popupContent: popupContent
                    },
                    geometry: JSON.parse(trail.geometry)
                }
                sendData.push(data);
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sendData));
        }
    });
});

app.listen(3000, "localhost", function(){
    console.log("Buffalo Mountain server has started!");
});

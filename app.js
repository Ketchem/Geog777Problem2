const express = require('express'),
    bodyParser = require('body-parser'), 
    app = express(), 
    request = require("request-promise");;


const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:admin@192.168.86.120:5432/ParkApp'
    
const pool = new Pool({
      connectionString: connectionString,
    });

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/map", function(req, res){
    res.render("map");
});

app.get("/reviews/:id", function(req, res){
    queryString = "SELECT reviewid, rating, comments, userid, trailid FROM review WHERE trailid = '" + req.params.id + "'";

    pool.query(queryString, (err, reviews)=> {
        if (err) {
            throw err
          }
          else {
            // res.setHeader('Content-Type', 'application/json');
            // res.end(JSON.stringify(reveiws.rows));
            res.render("reviews", {trailid:req.params.id, reviews:reviews.rows});
          }
    });
    
});

app.get("/api/reviews/:id", function(req, res){
    // console.log(req.params.id);
    queryString = "SELECT reviewid, rating, comments, userid, trailid FROM review WHERE trailid = '" + req.params.id + "'";
    // console.log(req.query.param);
    pool.query(queryString, (err, reviews)=> {
        if (err) {
            throw err
          }
          else {
            // res.setHeader('Content-Type', 'application/json');
            // res.end(JSON.stringify(reveiws.rows));
            res.status(200)
                .json(reviews.rows)
                .end();
            // res.render("reviews", {trailid:req.params.id, reviews:reviews.rows});
          }
    });
});


app.get("/create/review/:id", function(req, res){
    res.render("createReview", {trailid:req.params.id});
});

//Return userid by username or email (query string)
app.get("/api/userid", function(req, res){
    // console.log("userid api " + req.query);
    var username = req.query.username;
    var email = req.query.email;

    // console.log(username);
    if(typeof username !== 'undefined'){
        // console.log("Here");
        queryString = "SELECT userid FROM public.user WHERE username = '" + username + "'";
        pool.query(queryString, (err, users)=> {
            if (err) {
                // throw err
                res.status(500);
                res.end("An Error Occurred");
              }
            else {
                if(users.rows.length > 0){
                    sendData = {userid:users.rows[0].userid};
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(sendData));
                }
                else{
                    res.status(204);
                    res.send("User Not Found");
                }
            }
        });
    }
    else if (typeof email !== 'undefined'){
        queryString = "SELECT userid FROM public.user WHERE email = '" + email + "'";
        // console.log(queryString);
        pool.query(queryString, (err, users)=> {
            if (err) {
                throw err
              }
            else {
                sendData = {userid:users.rows[0].userid};
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sendData));
            }
        });
    }
});

app.get("/api/trails/all", function(req, res){
    // pool.query('SELECT trailid, name, description, length, difficulty, type, parkid, ST_AsGeoJSON(geom) as geometry FROM trail', (err, trails) => {
    pool.query('SELECT * FROM trailReveiwSummary', (err, trails) => {
        if (err) {
          throw err
        }
        else {
            var sendData = [];
            trails.rows.forEach(function(trail){
                var reviewURL = "/reviews/" + trail.trailid.toString();
                var trailReviews = "<p>" + trail.name + "</p></br><a href='" + reviewURL + "'>Reviews</a>"
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
                        trailReviews: trailReviews,
                        rating: trail.rating,
                        numreviews : trail.numreviews
                    },
                    geometry: JSON.parse(trail.geom)
                }
                sendData.push(data);
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sendData));
        }
    });
});

app.get("/api/trails", function(req, res){
    var filterType = req.query.filterType;
    var filterValue = req.query.filterValue;

    // console.log(filterType, filterValue);

    if (filterType === 'avgRating'){
        var queryString = "SELECT * FROM trailReveiwSummary WHERE RATING >= '" + req.query.filterValue + "'";
        // console.log(queryString);
    }
    pool.query(queryString, (err, trails) => {
        if (err) {
          throw err
        }
        else {
            // console.log(trails.rows)
            var sendData = [];
            trails.rows.forEach(function(trail){
                var reviewURL = "/reviews/" + trail.trailid.toString();
                var trailReviews = "<p>" + trail.name + "</p></br><a href='" + reviewURL + "'>Reviews</a>"
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
                        trailReviews: trailReviews,
                        rating: trail.rating,
                        numreviews : trail.numreviews
                    },
                    geometry: JSON.parse(trail.geom)
                }
                // console.log(data);
                sendData.push(data);
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(sendData));
        }
    });
});

// TODO: Check on encoded values
app.post("/create/review/:id", function(req, res){
    var trailid = req.params.id;
    var username = req.body.username;
    var rating = req.body.rating;
    var comments = req.body.comments;
    var userid;

    // console.log(trailid, username, rating, comments);

    //Search for username
    async function getUserId(){
        // url = "/api/userid"
        // return await request(url, userid);

        var options = {
            uri: "http://localhost:3000/api/userid",
            method: "GET",
            qs: {
                username : username
            },
            json: true
        }
        
        try {
            var result = await request(options);
            return result;
        } catch (err) {
            console.error(err);
        }

    };

    //if not found create user
    async function createUser(){
        return null;
    };

    //if found post review with found userid
    async function addReview(userid, rating, comments, trailid){
        queryString = "INSERT INTO public.review(rating, comments, userid, trailid) VALUES ( '" + rating +"', '" + 
            comments + "', '" + userid + "', '" + trailid + "')";
        pool.query(queryString, (err, users)=> {
            if (err) {
                throw err
                return false;
            }
        });
        return true;
    };

    async function createReview(){
        var userid = await getUserId();
        var trailAdded = false;

        console.log(userid);
        if (typeof userid !== 'undefined'){
            userid = userid.userid;
            trailAdded = await addReview(userid, rating, comments, trailid);
        }
        else {
            console.log("User Not Found");
        }

        if (trailAdded){
            res.status(201);
            res.redirect('/map');
        }
        else{
            res.status(501);
            res.send("Something didn't work")
        }
    }

    createReview();
    // res.send("Body Data: " + trailid + " " + username + " " + rating + " " + comments);
    // res.status(204);
    // res.end();
});

app.post("/create/user", function(req, res){
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var password = 'password'
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;

    var newUserId;
    queryString = "INSERT INTO public.user(username)VALUES ('"+username+"')";
    pool.query(queryString, (err, users)=> {
        if (err) {
            throw err
            }
        else{
            queryString = "SELECT userid FROM public.user WHERE username = '" + username + "'";
            pool.query(queryString, (err, user)=> {
                if (err) {
                    throw err
                    }
                    else {
                    // res.setHeader('Content-Type', 'application/json');
                    // res.end(JSON.stringify(reveiws.rows));
                    newUserId = user.rows[0].userid;
                    // console.log(newUserId)
                    // return newUserId;
                    // res.render("reviews", {trailid:req.params.id, reviews:reviews.rows});
                    }
            });
        }
        // return newUserId;
    });
    res.send({"newUserId": newUserId});
});


app.listen(3000, "localhost", function(){
    console.log("Buffalo Mountain server has started!");
});

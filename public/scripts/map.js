L.mapbox.accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';

var map = L.mapbox.map('map').setView([36.2740527, -82.34555], 15);

L.mapbox.styleLayer('mapbox://styles/ketchem2/cjy7rq3i508iy1cmpqt7uevfj').addTo(map);

var locationButton;
var locationOn = false;
var locationMarker;
var locationRadius;
var highlightedFeature;
var trailsLayer;
var poiLayer;


var findMyLocation = L.Control.extend({
 
    options: {
        position: 'topleft' 
    },
 
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom location-button');
        container.innerHTML = '<i class="fas fa-location"></i>';
        container.onclick = toggleLocation;
        return container;
    }
});

var ratingFilter  = L.Control.extend({
 
    options: {
        position: 'topright' 
    },
 
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom filter-rating');
        // container.append('Filter By Rating: ');
        container.innerHTML =   'Filter By Rating: <span id="rating1" class="far fa-star"></span>'+
                                '<span id="rating2" class="far fa-star"></span>'+
                                '<span id="rating3" class="far fa-star"></span>'+ 
                                '<span id="rating4" class="far fa-star"></span>'+ 
                                '<span id="rating5" class="far fa-star"></span>';
        return container;
    }
});

map.addControl(new findMyLocation());
map.addControl(new ratingFilter());

$('#rating1').click(function(){filterTrails(1)});
$('#rating2').click(function(){filterTrails(2)});
$('#rating3').click(function(){filterTrails(3)});
$('#rating4').click(function(){filterTrails(4)});
$('#rating5').click(function(){filterTrails(5)});

locationButton = $(".location-button")[0];

var trailStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

var highlight = {
    "color": "#00691a",
    "weight": 5,
    "opacity": 0.65
};

var parkingStyle = {
    "color": "#9e9e9e",
    "weight": 5,
    "opacity": 0.65
};

var roadStyle = {
    "color": "#c40606",
    "weight": 5,
    "opacity": 0.65
};

var parkBoundaryStyle = {
    "color": "#299e64",
    "weight": 10,
    "fillOpacity": 0
}

var poistyle = {
    // radius: 8,
    // fillColor: "#ff7800",
    // color: "#000",
    // weight: 1,
    // opacity: 1,
    // fillOpacity: 0.8
}

addTrails();
addParkingLoop();
addRoad();
addParkBoundary();
addPois();

function toggleLocation(){
    if (locationOn){
        removeLocation();
        locationOn = false;
    }
    else {
        map.locate({setView: true, maxZoom: 16});
        map.on('locationfound', onLocationFound);
        locationOn = true;
    }
}

function addTrails(){
    // $.ajax("data/BuffaloMtnTrails.geojson", {
    //     dataType: "json",
    //     success: createTrailsLayer
    // });
    $.ajax("api/trails/all", {
        dataType: "json",
        success: createTrailsLayer
    });
};

function addPois(){
    // $.ajax("data/BuffaloMtnTrails.geojson", {
    //     dataType: "json",
    //     success: createTrailsLayer
    // });
    $.ajax("api/poi/all", {
        dataType: "json",
        success: createPoiLayer
    });
};

function createTrailsLayer(response, status, jqXHRobject){
    // response.forEach(function(trail){
    //     console.log(trail);
    // });
    var trails = {
        type: "FeatureCollection",
        name: "BuffaloMtnTrails",
        features:response
    };
    // console.log (trails);
    trailsLayer = L.geoJSON(trails, {onEachFeature: onEachFeature, style: trailStyle}).addTo(map);
    
    trailsLayer.bringToFront(map);
    // console.log(response);
};

function createPoiLayer(response, status, jqXHRobject){
    // response.forEach(function(trail){
    //     console.log(trail);
    // });
    var pois = {
        type: "FeatureCollection", 
        name: "BuffaloMtnPois",
        features:response
    };
    // console.log (trails);
    poiLayer = L.geoJSON(pois, {onEachFeature: onEachPoiFeature, style: poistyle}).addTo(map);
    
    poiLayer.bringToFront(map);
    // console.log(response);
};

function onEachFeature(feature, layer) {
    // does this feature have a property named trailReviews
    if (feature.properties && feature.properties.trailReviews) {
        // layer.bindPopup(feature.properties.popupContent);
        layer.on({
            click: getReviews
        });
        // console.log(feature.properties.trailReviews);

    }
}



function onEachPoiFeature(feature, layer) {
    // does this feature have a property named trailReviews
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
        // layer.on({
        //     click: getReviews
        // });
        // console.log(feature.properties.trailReviews);

    }
}

function getReviews(e){
    // console.log(e);
    var trailName = e.target.feature.properties.name;
    // console.log(trailName);
    if(typeof highlightedFeature !== 'undefined'){
        highlightedFeature.setStyle(trailStyle);
    }
    highlightedFeature = e.target
    highlightedFeature.setStyle(highlight);
    var infoPanel = $("#info-panel").css("height", "35%")
    var trailid = e.target.feature.properties.trailid;
    $.ajax("api/reviews/" + trailid, {
        dataType: "json",
        success: writeTrailReviews
    });

    function writeTrailReviews(response, status, jqXHRobject){
        infoPanel.empty();
        reviews = response;
        // console.log(reviews);
        reviewList = "";
        reviews.forEach(function(review){
            reviewList = reviewList + "<li>Rating: " + review.rating + " " + review.comments + "</li>";
        });
        // console.log(trailid);
        // <button class='btn btn-primary' id='closePanel'>Close</button>
        var reviewHtml = "<h4>Reviews - "+trailName+"</h4><ul>" + reviewList + "</ul><a id = 'createReview' class='btn btn-success' href='/create/review/"+ trailid + "'>Create New Review</a><button class='btn btn-primary' id='closePanel'>Close</button> "
        // var reviewHtml = "<h4>White Rock Loop</h4><h5>Reviews <a href='/create/review/"+ trailid + "'>Create New Review</a></h5><ul>" + reviewList + "</ul><button class='btn btn-primary' id='closePanel'>Close</button> "
        // console.log(reviewHtml);
        infoPanel.append(reviewHtml);
        $("#closePanel").on("click", function(){
            infoPanel.empty();
            infoPanel.css("height", "0%");
            if(typeof highlightedFeature !== 'undefined'){
                highlightedFeature.setStyle(trailStyle);
            }
        });
    };
    
    // console.log(trailid);
}

function addParkingLoop(){
    $.ajax("data/BuffaloMtnParking.geojson", {
        dataType: "json",
        success: createParkingLoopLayer
    });
};

function addParkBoundary(){
    $.ajax("data/BuffaloMoutainParkBoundary.geojson", {
        dataType: "json",
        success: createParkBoundaryLayer
    });
};


function createParkingLoopLayer(response, status, jqXHRobject){
    // console.log(response);
    var parkingLayer = L.geoJSON(response, parkingStyle).addTo(map);

    // trailsLayer.bringToFront(map);
    // console.log("here");
};

function createParkBoundaryLayer(response, status, jqXHRobject){
    console.log(response);
    var parkBoundaryLayer = L.geoJSON(response, parkBoundaryStyle).addTo(map);

    // trailsLayer.bringToFront(map);
    // console.log("here");
};


function addRoad(){
    $.ajax("data/BuffaloMtnRoad.geojson", {
        dataType: "json",
        success: createRoadLayer
    });
};

function createRoadLayer(response, status, jqXHRobject){
    var roadsLayer = L.geoJSON(response, roadStyle).addTo(map);
};

function onLocationFound(e) {
    var radius = e.accuracy;

    locationMarker = L.marker(e.latlng, {customId: "yourLocation"}).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    locationRadius = L.circle(e.latlng, radius, {customId :"locationRadius"}).addTo(map);
}

function removeLocation(){
    console.log('remove layer method hit');
    locationMarker.remove(map);
    locationRadius.remove(map);
};

// map.on('click', function(e){
//     var coord = e.latlng;
//     var lat = coord.lat;
//     var lng = coord.lng;
//     console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
// });

function filterTrails(rating){
    $('.fas').addClass('far');
    $('.fas').removeClass('fas');
    for(var i = 1; i <= rating; i++){
        $('#rating' + i).removeClass('far');
        $('#rating' + i).addClass('fas');
    }

    // console.

    map.removeLayer(trailsLayer);

    var url = 'api/trails/?filterType=avgRating&filterValue=' + rating;

    $.ajax(url, {
        dataType: "json",
        success: createTrailsLayer
    });
}
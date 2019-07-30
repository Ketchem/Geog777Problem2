L.mapbox.accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';

var map = L.mapbox.map('map').setView([36.2740527, -82.34555], 15);

L.mapbox.styleLayer('mapbox://styles/ketchem2/cjy7rq3i508iy1cmpqt7uevfj').addTo(map);

var locationButton;
var locationOn = false;
var locationMarker;
var locationRadius;


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

map.addControl(new findMyLocation());

locationButton = $(".location-button")[0];

var trailStyle = {
    "color": "#ff7800",
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

addTrails();
addParkingLoop();
addRoad();

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
    $.ajax("api/trails", {
        dataType: "json",
        success: createTrailsLayer
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
    var trailsLayer = L.geoJSON(trails, {onEachFeature: onEachFeature, style: trailStyle}).addTo(map);
    
    trailsLayer.bringToFront(map);
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

function getReviews(e){
    var infoPanel = $("#info-panel").css("height", "35%")
    var trailid = e.target.feature.properties.trailid;
    $.ajax("api/reviews/" + trailid, {
        dataType: "json",
        success: writeTrailReviews
    });

    function writeTrailReviews(response, status, jqXHRobject){
        infoPanel.empty();
        reviews = response;
        console.log(reviews);
        reviewList = "";
        reviews.forEach(function(review){
            reviewList = reviewList + "<li>Rating: " + review.rating + " " + review.comments + "</li>";
        });
        console.log(trailid);
        var reviewHtml = "<h4>Reviews for Trail</h4><a href='/create/review/"+ trailid + "'>Create New Review</a><ul>" + reviewList + "</ul><button class='btn btn-primary' id='closePanel'>Close</button> "
        // console.log(reviewHtml);
        infoPanel.append(reviewHtml);
        $("#closePanel").on("click", function(){
            infoPanel.empty();
            infoPanel.css("height", "0%");
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

function createParkingLoopLayer(response, status, jqXHRobject){
    console.log(response);
    var trailsLayer = L.geoJSON(response, parkingStyle).addTo(map);

    trailsLayer.bringToFront(map);
    // console.log("here");
};

function addRoad(){
    $.ajax("data/BuffaloMtnRoad.geojson", {
        dataType: "json",
        success: createRoadLayer
    });
};

function createRoadLayer(response, status, jqXHRobject){
    var trailsLayer = L.geoJSON(response, roadStyle).addTo(map);
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
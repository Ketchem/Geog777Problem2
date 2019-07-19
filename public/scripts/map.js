L.mapbox.accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';

var map = L.mapbox.map('map').setView([36.2740527, -82.34555], 15);

L.mapbox.styleLayer('mapbox://styles/ketchem2/cjy7rq3i508iy1cmpqt7uevfj').addTo(map);

var trailStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

addTrails();
addParkingLoop();
addRoad();


function addTrails(){
    $.ajax("data/BuffaloMtnTrails.geojson", {
        dataType: "json",
        success: createTrailsLayer
    });
};

function createTrailsLayer(response, status, jqXHRobject){
    var trailsLayer = L.geoJSON(response, trailStyle).addTo(map);

    trailsLayer.bringToFront(map);
    console.log("here");
};

function addParkingLoop(){
    $.ajax("data/BuffaloMtnParking.geojson", {
        dataType: "json",
        success: createParkingLoopLayer
    });
};

function createParkingLoopLayer(response, status, jqXHRobject){
    var trailsLayer = L.geoJSON(response, trailStyle).addTo(map);

    trailsLayer.bringToFront(map);
    console.log("here");
};

function addRoad(){
    $.ajax("data/BuffaloMtnRoad.geojson", {
        dataType: "json",
        success: createRoadLayer
    });
};

function createRoadLayer(response, status, jqXHRobject){
    var trailsLayer = L.geoJSON(response, trailStyle).addTo(map);

    trailsLayer.bringToFront(map);
    console.log("here");
};

map.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
});

map.locate({setView: true, maxZoom: 16});
function onLocationFound(e) {
    var radius = e.accuracy;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V0Y2hlbTIiLCJhIjoiY2pjYzQ5ZmFpMGJnbTM0bW01ZjE5Z2RiaiJ9.phQGyL1FqTJ-UlQuD_UFpg';

var map = new mapboxgl.Map({
container: 'map', // container id
style: 'mapbox://styles/ketchem2/cjy7rq3i508iy1cmpqt7uevfj', // stylesheet location
center: [-82.351, 36.273681], // starting position [lng, lat]
zoom: 13.5 // starting zoom
});

map.on('load', function(){
    addTrails();
});

function addTrails(){
    $.ajax("/data/BuffaloMountainTrials.json", {
        dataType: "json",
        success: createTrailsLayer
    });
};

function createTrailsLayer(response, status, jqXHRobject){
    console.log(response);
};
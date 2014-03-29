var map;
var Events = require('./controllers/events').eventCollection;
var Event = require('./controllers/events').eventModel;
var eventMarkers = [];
var router = require('./router');
var collection;
var EventListener = {};
var EventView = require('./controllers/events').newEvent;

$(document).ready(function(){
	configureEventListener();
	// router.start(EventListener);
	$(document).foundation();
	$('#myModal').foundation('reveal', 'open');
	collection = new Events();
	map = new GMaps({
	el: '#map_canvas',
	lat: -12.043333,
	lng: -77.028333,
	zoomControl : true,
	zoomControlOpt: {
		position: 'TOP_LEFT'
	}
	});

	setUpContextMenu();

	map.map.setMapTypeId(google.maps.MapTypeId.HYBRID);

	
	setUpSearchBoxListener();

	boundsListener();
});


function setUpSearchBoxListener () {
	// Searchbox
	var input = (document.getElementById('pac-input'));
	var input2 = (document.getElementById('pac-input2'));
	 
	map.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox((input));
	var searchBox2 = new google.maps.places.SearchBox((input2));

	google.maps.event.addListener(searchBox2, 'places_changed', function() {
		$('#myModal').foundation('reveal', 'close');		
		var places = searchBox2.getPlaces();
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			bounds.extend(place.geometry.location);
		}
		map.map.fitBounds(bounds);
	
	});
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0, place; place = places[i]; i++) {
			bounds.extend(place.geometry.location);
		}
		map.map.fitBounds(bounds);
	
	});
}



function boundsListener () {
	google.maps.event.addListener(map.map, 'idle', function (ev) {
		fetchCollectionForViewdMap();
	});
}



function setUpContextMenu () {
	map.setContextMenu({
		control: 'map',
		options: [{
			title: 'New Event',
			name: 'new_event',
			action: function(e) {
				var view = new EventView();
				view.render(e,EventListener)
			}
		}]
	});
}



function fetchCollectionForViewdMap () {
	var bounds = map.map.getBounds();
	var ne = bounds.getNorthEast();
	var se = bounds.getSouthWest();
	var distance = google.maps.geometry.spherical.computeDistanceBetween (ne, se) / 1000;
	
	collection.reset();
	collection.url = '/eventsList';

	collection.fetch({data : 
		{ distance : distance,
		 longitude : map.map.getCenter().lng(), 
		  latitude : map.map.getCenter().lat() }}).complete(fetchCollectionComplete);
}

function fetchCollectionComplete (res, status) {
	map.removeMarkers();
	collection.each(function (event) {
		var date = new Date(event.get('start_time'));
		var loc = event.get('loc');
		var contentString = '<div id="content">'+
			'<p><strong>Where:</strong><br /> '+ event.get('where') +' <br />' +
			'<strong>When:</strong><br /> ' + date.toLocaleTimeString() + ' <br />' +
			'<strong>Description:</strong><br /> ' + event.get('description') + '</p>' +
			'<br /> <a href="/#gugus">link</a>' +
			'</div>';				
		map.addMarker({
			lat : loc[1],
			lng : loc[0],					
			infoWindow : {
				content : contentString
			}
		})		
	});
}


function configureEventListener(){
	_.extend(EventListener,Backbone.Events);
	EventListener.on('eventsaved', function(msg){
		console.log(status);
		fetchCollectionForViewdMap();
	})

	var object = {};
}



var map;
var MyEventsView = require('./controllers/events').myEvents;
var Events = require('./controllers/events').eventCollection;
var Event = require('./controllers/events').eventModel;
var EventDetailView = require('./controllers/events').detailEvent;
var eventMarkers = [];
var router = require('./router');
var collection;
var collectionMyEvents;
var EventListener = {};
var EventView = require('./controllers/events').newEvent;
var moment = require('moment');


$(document).ready(function(){


	configureEventListener();
	collection = new Events();
	fetchMyEvents();
	router.start(collection);
	$(document).foundation();
	
	map = new GMaps({
	el: '#map_canvas',
	lat: 47,
	lng: 8,
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

	collection.fetch({ data : 
		{ distance : distance,
		 longitude : map.map.getCenter().lng(), 
		  latitude : map.map.getCenter().lat() 
		}
	}).complete(fetchCollectionComplete);
}

function fetchCollectionComplete (res, status) {
	map.removeMarkers();
	collection.each(function (event) {

		var start_time  = moment(event.get('start_time'));
		
		var end_time  = moment(event.get('end_time'));

		event.set('start_time', start_time.format('LLL'));
		event.set('end_time', end_time.format('LLL'));
		var date = new Date(event.get('start_time'));
		var loc = event.get('loc');
		
		map.addMarker({
			lat : loc[1],
			lng : loc[0],
			click : function () {	
				var view = new EventDetailView();
				view.render(event);
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

function fetchMyEvents () {

	collectionMyEvents = new Events();

	collectionMyEvents.url = '/myEvents';

	collectionMyEvents.fetch().complete(function  (res, status) {
		renderMyEvents();
	})
}


function renderMyEvents () {

	console.log(collectionMyEvents);
	var view = new MyEventsView({collection : collectionMyEvents});
	view.render();
}
///=====================================================
// ERROR HANDLING


$.ajaxSetup({
            statusCode: {
                401: function(){
           			alert('Please log in with your account');
                }
            }
        });


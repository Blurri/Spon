//Dependencies
var SearchText = require('./search');
var map;


$(document).ready(function (){
	
	console.log(google);

	
	//================================
	//Startup screen
	var searchText = new SearchText();
	searchText.render();
	// foundation
 	$(document).foundation();
	//Startup screen end
	//================================
	$("#map_canvas").css("height", $(window).height());
	$("#modal-content,#modal-background").toggleClass("active");
	google.maps.event.addDomListener(window, "load", initMap);

})

function initMap(){
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
        zoom: 8,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"),myOptions);

    var input = (document.getElementById('pac-input'));

  	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  	var searchBox = new google.maps.places.SearchBox((input));


  	var markers = [];

  	google.maps.event.addListener(searchBox, 'places_changed', function() {

    var places = searchBox.getPlaces();

    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });
};
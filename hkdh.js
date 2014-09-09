// what are good programming practices and would i gaf

var numPoints = 2;
var map = null;
var playerCar = null;
var routePoly = null;
var ready = false;
var pressedKeys = [false, false, false, false, false]; // up, left,down, right, space

var Vehicle = function(){
	this.marker = new google.maps.Marker({
		position: map.getCenter(),
		icon: {
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			strokeColor: "#4169E1",
			rotation: 0,
			scale: 5
		},
		map: map
	});
	this.turnRate = .01;
	this.speed = 0;
	this.angle = 0;
	//new DOMSprite(window.document.getElementById("map-canvas"), 50, 50, "images/mhacks.png");
};
Vehicle.__name__ = true;
Vehicle.prototype = {};

function addPoint() {
	numPoints++;
	$('#points').append('Point ' + numPoints + ': <input type="text" name="' + numPoints + '"><br />');
}

function route() {
	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var mapOptions = {
      //center: new google.maps.LatLng(-34.397, 150.644),
      disableDefaultUI: true,
      draggable: false,
      //scrollwheel: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      zoom: 4
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    directionsDisplay.setMap(map);
    
    var points = [];
	
	$("#points > input").each(function(){
		points.push($(this).val());
	});
	
	var first = points[0];
	var last = points[points.length - 1];
	var middle = points.slice(1, points.length - 1);
	var directionsReq = {
		origin: first,
		//waypoints: waypoints,
		destination: last,
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	var waypoints = [];
	
	for(var i = 0; i < middle.length; i++){
		if(middle[i] != "")
			waypoints.push({'location': middle[i]});
	}
	
	//console.log(waypoints);
	
	if(waypoints.length > 0){
		//console.log("hi");
		directionsReq.waypoints = waypoints;
	}
	
	
	directionsService.route(directionsReq, function(response, status) {
	    if (status == google.maps.DirectionsStatus.OK){
	    	//console.log(response);
	    	var lng = response.routes[0].legs[0].start_location.B;
	    	var lat = response.routes[0].legs[0].start_location.k;
	    	var path = [];
	    	//console.log(lat, long);
	    	//var polyString = response.routes[0].overview_polyline;
	    	
	    	for (var a = 0; a < response.routes[0].legs.length; a++){
	    		for (var b = 0; b < response.routes[0].legs[a].steps.length; b++){
	    			var decoded = google.maps.geometry.encoding.decodePath(response.routes[0].legs[a].steps[b].polyline.points);
	    			//console.log(decoded);
	    			path = path.concat(decoded);
	    		};
	    	};
	    		
	    	//console.log(path);
	    	
	    	var polyOptions = {
	    		path: path,
	    		strokeColor: "#484848",
	    		strokeOpacity: 1.0,
	    		strokeWeight: 10,
	    		clickable: false,
	    		map: map
	    	};
	    	routePoly = new google.maps.Polyline(polyOptions);
	    	//console.log($("#powerups"));
	    	
	    	//console.log(routePoly);
	    	//directionsDisplay.setDirections(response);
	    	setTimeout(function(){
	    		map.panTo(new google.maps.LatLng(lat, lng));
	    		map.setZoom(22);
	    		playerCar = new Vehicle();
	    		ready = true;
	    		gameLoop(routePoly);
	    	}, 3000);
	    	
	    }
	  });
}

function gameLoop(poly){
	//console.log(poly);
	var speedLimit = 1.0;
	
	setInterval(function(){
		if(pressedKeys[0]){
			playerCar.speed = Math.min(playerCar.speed + .005, speedLimit);
		}
		if(pressedKeys[1]){
			playerCar.angle -= playerCar.turnRate * 360;
		}
		if(pressedKeys[2]){
			playerCar.speed = Math.max(playerCar.speed - .005, -1 * speedLimit);
		}
		if(pressedKeys[3]){
			playerCar.angle += playerCar.turnRate * 360;
		}
		if(pressedKeys[4]){
			
		}
		
		var newLat = (playerCar.marker.getPosition().lat() + .00005 * playerCar.speed * Math.cos(playerCar.angle/360*2*Math.PI)) % 180;
		var newLng = (playerCar.marker.getPosition().lng() + .00005 * playerCar.speed * Math.sin(playerCar.angle/360*2*Math.PI)) % 180;
		
		playerCar.marker.setPosition(new google.maps.LatLng(newLat, newLng));
		
		playerCar.marker.setIcon({
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			strokeColor: "#4169E1",
			rotation: playerCar.angle,
			scale: 5
		});
		
		if(!google.maps.geometry.poly.isLocationOnEdge(playerCar.marker.getPosition(), poly, .0002)){
			if(playerCar.speed > 0)	
				playerCar.speed = Math.min(playerCar.speed, speedLimit / 6);
			else if(playerCar.speed < 0)
				playerCar.speed = Math.max(playerCar.speed, speedLimit / -6);
		}
		
		if(playerCar.speed > 0 && !pressedKeys[0]){
			playerCar.speed = Math.max(playerCar.speed - .01, 0);
		}
		else if(playerCar.speed < 0 && !pressedKeys[2]){
			playerCar.speed = Math.min(playerCar.speed + .01, 0);
		}
		
		map.panTo(new google.maps.LatLng(newLat, newLng));
		
		//playerCar.marker.setMap(null);
		//playerCar.marker = temp;
		//console.log(playerCar.marker);
	}, 35);
	
	setInterval(function(){
		$("#powerups tr").find('td').each(function(){
			var imgSel = Math.floor(Math.random() * 5);
			if(imgSel == 0){
				$(this).html("<img class='powerup' src='images/bull.png' />");
			}
			else if(imgSel == 1){
				$(this).html("<img class='powerup' src='images/bullgold.png' />");
			}
			else if(imgSel == 2){
				$(this).html("<img class='powerup' src='images/uber.jpg' />");
			}
			else if(imgSel == 3){
				$(this).html("<img class='powerup' src='images/greenshell.png' />");
			}
			else if(imgSel == 4){
				$(this).html("<img class='powerup' src='images/star.jpg' />");
			}
		});
	}, 10000);
}

$(document).keydown(function(e) {
	    switch(e.which) {
	    	case 32: // spacebar
	    		pressedKeys[4] = true;
	    	break;
	    	
	        case 37: // left
	        	pressedKeys[1] = true;
	        	
	        	//console.log(playerCar.marker);
	        break;
	
	        case 38: // up
	        	pressedKeys[0] = true;
	        	
	        break;
	
	        case 39: // right
	        	pressedKeys[3] = true;
	        	
	        break;
	
	        case 40: // down
	        	pressedKeys[2] = true;
	        	
	        break;
	
	        default: return; // exit this handler for other keys
	    }
	    if(ready)
    		e.preventDefault(); // prevent the default action (scroll / move caret)
});

$(document).keyup(function(e) {
	    switch(e.which) {
	    	case 32: // spacebar
	    		pressedKeys[4] = false;
	    	break;
	    	
	        case 37: // left
	        	pressedKeys[1] = false;
	        break;
	
	        case 38: // up
	        	pressedKeys[0] = false;
	        break;
	
	        case 39: // right
	        	pressedKeys[3] = false;
	        break;
	
	        case 40: // down
	        	pressedKeys[2] = false;
	        break;
	
	        default: return; // exit this handler for other keys
	    }
	    if(ready)
    		e.preventDefault(); // prevent the default action (scroll / move caret)
});
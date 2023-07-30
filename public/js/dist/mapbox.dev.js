"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.displayMap = void 0;

/* eslint-disable */
var displayMap = function displayMap(locations) {
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWl2YW55ayIsImEiOiJjbGtpMzVzN3QwaHFmM2NrZ25yb21pYzJuIn0.tGyHZpN73Bit9NEftXCiJw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/aivanyk/clkia2z98003g01py5tl55tr8',
    scrollZoom: false // center: [-118.113491, 34.111745],
    // zoom: 4,
    // interactive: false,

  });
  var bounds = new mapboxgl.LngLatBounds();
  locations.forEach(function (loc) {
    var el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);
    new mapboxgl.Popup({
      offset: 30
    }).setLngLat(loc.coordinates).setHTML("<p>Day ".concat(loc.day, ": ").concat(loc.description, "<p>")).addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};

exports.displayMap = displayMap;
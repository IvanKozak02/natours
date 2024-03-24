
export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoiaXZhbi1rb3phayIsImEiOiJjbHR6dWthZHkwM3FxMmpvOTlkNXJvYXR2In0.q9OE0whvu5J5_SFMFFPJNw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ivan-kozak/cltzx3qnd009j01prbvm94peo',
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc=>{
    // 1) Create HTML element for marker
    const marker = document.createElement('div');
    marker.classList.add('marker');

    // 2) Add marker
    new mapboxgl.Marker({
      element: marker,
      anchor: 'bottom',
    }).setLngLat(loc.coordinates).addTo(map);   // add marker to map

    // 3) Add popup
    new mapboxgl.Popup({
      offset: 30,

    }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)

    // 3) Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      right: 100,
      left: 100,
    }
  })
}



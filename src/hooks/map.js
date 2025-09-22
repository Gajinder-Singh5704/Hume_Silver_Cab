
// places suggestion api
export const getPlaces = async (input) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject("Google Maps SDK not loaded yet");
      return;
    }

    const service =  new window.google.maps.places.AutocompleteService();

    service.getPlacePredictions(
      {
        input,
         types: ["(cities)"], // optional: restrict to cities
    componentRestrictions: { country: "au" }, // Australia
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve({ predictions });
        } else {
          resolve({ predictions: [] });
        }
      }
    );
  });
};


// hooks/map.js
export const attachPlacesAutocomplete = (inputElement, onPlaceSelected) => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.warn("Google Maps SDK not loaded yet");
    return null;
  }

  const options = {
    types: ["(cities)"], // optional
    componentRestrictions: { country: "au" },
    fields: ["formatted_address", "geometry", "place_id"],
  };

  const autocomplete = new window.google.maps.places.Autocomplete(
    inputElement,
    options
  );

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (onPlaceSelected) onPlaceSelected(place);
  });

  return autocomplete;
};


// get lat lon 
export const getGeocode = (s) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject("Google Maps SDK not loaded yet");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ placeId: s.place_id }, (results, status) => {
      if (
        status === window.google.maps.GeocoderStatus.OK &&
        results[0]?.geometry?.location
      ) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          description: s.description,
        });
      } else {
        reject("Geocoding failed: " + status);
      }
    });
  });
};

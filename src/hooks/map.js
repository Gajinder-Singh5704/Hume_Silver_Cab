// hooks/map.js
export const getPlaces = (input) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject("Google Maps SDK not loaded yet");
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();

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

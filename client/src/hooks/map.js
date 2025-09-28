export const getGeocode = ({ place_id, sessionToken, description }) => {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      reject("Google Maps Places SDK not loaded yet");
      return;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.getDetails(
      {
        placeId: place_id,
        sessionToken,
        fields: ["geometry", "formatted_address", "name"],
      },
      (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          resolve({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            description: description || place.formatted_address,
            name: place.name,
            address: place.formatted_address,
          });
        } else {
          reject("Place details failed: " + status);
        }
      }
    );
  });
};

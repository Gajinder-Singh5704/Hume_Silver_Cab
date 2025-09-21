import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

const MapUpdater = ({ selectedPlace, selectedPickup }) => {
  const map = useMap(); // ✅ actual google.maps.Map instance

  useEffect(() => {
    if (!map) return;

    if (selectedPlace) {
      map.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
      map.setZoom(13);
    } else if (selectedPickup) {
      map.panTo({ lat: selectedPickup.lat, lng: selectedPickup.lng });
      map.setZoom(13);
    }
  }, [map, selectedPlace, selectedPickup]);

  return null;
};

const MapSection = ({ selectedPlace, selectedPickup }) => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <div style={{ width: "100%", height: "100vh" }}>
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 53.54, lng: 10 }}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
          }}
        >
          <MapUpdater
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
          />

          {/* ✅ only render if valid object */}
          {selectedPlace && selectedPlace.lat && selectedPlace.lng && (
            <AdvancedMarker position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}>
              <Pin background="red" borderColor="white" glyphColor="white" />
            </AdvancedMarker>
          )}

          {selectedPickup && selectedPickup.lat && selectedPickup.lng && (
            <AdvancedMarker position={{ lat: selectedPickup.lat, lng: selectedPickup.lng }}>
              {console.log("object")}
              <Pin background="blue" borderColor="white" glyphColor="white" />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSection;

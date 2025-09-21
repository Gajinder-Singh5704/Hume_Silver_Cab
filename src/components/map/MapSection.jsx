import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

const MapUpdater = ({ selectedPlace, selectedPickup }) => {
  const map = useMap();
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

// Recenter button component
const RecenterButton = ({ selectedPickup }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (!map) return;

    if (selectedPickup) {
      map.panTo({ lat: selectedPickup.lat, lng: selectedPickup.lng });
      map.setZoom(13);
    } else {
      // fallback to default
      map.panTo({ lat: 53.54, lng: 10 });
      map.setZoom(10);
    }
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-5.5 right-2.5 z-50 bg-white shadow-md rounded-full p-4 text-sm font-medium sm:hidden"
    >
      📍
    </button>
  );
};

const MapSection = ({ selectedPlace, selectedPickup }) => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <div className="w-full h-full relative">
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 53.54, lng: 10 }}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
          }}
          zoomControl={false}
        >
          <MapUpdater selectedPlace={selectedPlace} selectedPickup={selectedPickup} />

          {selectedPickup && selectedPickup.lat && selectedPickup.lng && (
            <AdvancedMarker position={{ lat: selectedPickup.lat, lng: selectedPickup.lng }}>
              <Pin background="blue" borderColor="white" glyphColor="white" />
            </AdvancedMarker>
          )}

          <RecenterButton selectedPickup={selectedPickup} />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSection;
  
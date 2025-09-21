import React, { useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";

/** Draw a native google.maps.Polyline on the map for the given path.
 *  path: array of { lat: number, lng: number }
 */
const PolylineOverlay = ({ path = [] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (!window.google || !window.google.maps) return;
    if (!path || path.length < 2) return;

    // ensure lat/lng are numbers and in LatLngLiteral shape
    const latLngPath = path.map((p) => ({ lat: Number(p.lat), lng: Number(p.lng) }));

    const poly = new window.google.maps.Polyline({
      path: latLngPath,
      strokeColor: "#FF0000",
      strokeOpacity: 0.85,
      strokeWeight: 4,
      geodesic: true,
    });

    poly.setMap(map);

    return () => {
      poly.setMap(null);
    };
  }, [map, JSON.stringify(path)]); // stringify to trigger effect when path contents change

  return null;
};

const MapUpdater = ({ selectedPlace, selectedPickup, destinations }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (selectedPickup) {
      bounds.extend(selectedPickup);
    }
    destinations.forEach((dest) => {
      if (dest) bounds.extend(dest);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 80);
    } else if (selectedPlace) {
      map.panTo(selectedPlace);
      map.setZoom(13);
    }
  }, [map, selectedPlace, selectedPickup, destinations]);

  return null;
};

// Recenter button component
const RecenterButton = ({ selectedPickup, destinations }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (selectedPickup) bounds.extend(selectedPickup);
    destinations.forEach((dest) => dest && bounds.extend(dest));

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 80);
    } else {
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

const MapSection = ({ selectedPlace, selectedPickup, destinations = [] }) => {
  // build polyline path: pickup -> dest1 -> dest2 ...
  const path = [
    ...(selectedPickup ? [selectedPickup] : []),
    ...destinations.filter(Boolean),
  ];

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
          <MapUpdater
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
            destinations={destinations}
          />

          {/* Pickup marker */}
          {selectedPickup && (
            <AdvancedMarker position={selectedPickup}>
              <Pin background="blue" borderColor="white" glyphColor="white" />
            </AdvancedMarker>
          )}

          {/* Destination markers with numbers */}
          {destinations.map(
            (dest, idx) =>
              dest && (
                <AdvancedMarker key={idx} position={dest}>
                  <Pin
                    background="red"
                    borderColor="white"
                    glyphColor="white"
                    scale={1.2}
                  >
                    <span className="text-white font-bold">{idx + 1}</span>
                  </Pin>
                </AdvancedMarker>
              )
          )}

          {/* Native polyline overlay (straight lines between points) */}
          {path.length > 1 && <PolylineOverlay path={path} />}

          <RecenterButton
            selectedPickup={selectedPickup}
            destinations={destinations}
          />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSection;

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
const DirectionsOverlay = ({ origin, selectedDestination }) => {
  const map = useMap();
  const directionsRendererRef = React.useRef(null);
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;
    // if (!origin || !selectedDestination) return;

    const directionsService = new window.google.maps.DirectionsService();
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#ffb300ff",
            strokeWeight: 4,
          },
        }
      );
    }

    if (!origin || !selectedDestination) {
      // clear all polylines
      directionsRendererRef.current.setDirections({ routes: [] });
      return;
    }

    directionsService.route(
      {
        origin,
        destination: selectedDestination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRendererRef.current.setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      }
    );
  }, [map, origin, selectedDestination]);

  return null;
};

const MapUpdater = ({ selectedPlace, selectedPickup, selectedDestination }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();
    const hasPlace = selectedPlace;
    const hasPickup = !!selectedPickup;
    const hasDests = !!selectedDestination;

    if (hasPickup) {
      bounds.extend(selectedPickup);
    }

    if (hasDests) bounds.extend(selectedDestination);
    if (hasPickup && hasDests) {
      // Case 1: Pickup + selectedDestination → fit bounds
      map.fitBounds(bounds, 80);
    } else if (hasPickup) {
      // Case 2: Only pickup → zoom to pickup
      map.panTo(selectedPickup);
      map.setZoom(14);
    } else if (hasDests) {
      // Case 2b: Only selectedDestination → zoom to them
      map.fitBounds(bounds, 80);
    } else if (hasPlace) {
      map.panTo(selectedPlace);
      map.setZoom(14);
    } else {
      // Case 3: Neither → reset to default
      map.panTo({ lat: -37.6708716, lng: 144.8430578 });
      map.setZoom(12);
    }
  }, [map, selectedPlace, selectedPickup, selectedDestination]);

  return null;
};

// Recenter button component
const RecenterButton = ({ selectedPickup, selectedDestination }) => {
  const map = useMap();

  const handleRecenter = () => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (selectedPickup) bounds.extend(selectedPickup);
    selectedDestination.forEach((dest) => dest && bounds.extend(dest));

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 80);
    } else {
      map.panTo({ lat: -37.6708716, lng: 144.8430578 });
      map.setZoom(12);
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

const MapSection = ({
  selectedPlace,
  selectedPickup,
  selectedDestination = null,
}) => {
  // build polyline path: pickup -> dest1 -> dest2 ...

  const path = [
    ...(selectedPickup ? [selectedPickup] : []),
    ...(selectedDestination ? [selectedDestination] : []),
  ];

  const origin = selectedPickup;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <div className="w-full h-full relative touch-pan-y">
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 53.54, lng: 10 }}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_ID}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "cooperative",
          }}
          zoomControl={false}
        >
          <MapUpdater
            selectedPlace={selectedPlace}
            selectedPickup={selectedPickup}
            selectedDestination={selectedDestination}
          />

          {/* Pickup marker */}
          {selectedPickup && (
            <AdvancedMarker position={selectedPickup}>
              <Pin background="orange" borderColor="white" glyphColor="white"/>
            </AdvancedMarker>
          )}

          {/* selectedDestination markers with numbers */}
          {selectedDestination && (
            <AdvancedMarker position={selectedDestination}>
              <Pin
                background="orange"
                borderColor="white"
                glyphColor="white"
                scale={1.2}
              />
            </AdvancedMarker>
          )}

          {/* Directions route */}
          {
            <DirectionsOverlay
              origin={origin}
              selectedDestination={selectedDestination}
            />
          }

          <RecenterButton
            selectedPickup={selectedPickup}
            selectedDestination={selectedDestination}
          />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapSection;

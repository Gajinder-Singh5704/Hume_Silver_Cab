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
const DirectionsOverlay = ({ origin, waypoints = [], destination }) => {
  const map = useMap();
  const directionsRendererRef = React.useRef(null);
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;
    // if (!origin || !destination) return;

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

     if (!origin || !destination) {
    // clear all polylines
    directionsRendererRef.current.setDirections({ routes: [] });
    return;
  }

    // Filter out null waypoints
    const validWaypoints = waypoints.filter(Boolean).map((wp) => ({
      location: wp,
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        waypoints: validWaypoints,
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
  }, [map, origin, destination, JSON.stringify(waypoints)]);

  return null;
};

const MapUpdater = ({ selectedPlace, selectedPickup, destinations }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();
    const hasPlace = selectedPlace;
    const hasPickup = !!selectedPickup;
    const hasDests = destinations.some(Boolean);

    if (hasPickup) {
      bounds.extend(selectedPickup);
    }
    destinations.forEach((dest) => {
      if (dest) bounds.extend(dest);
    });

    if (hasPickup && hasDests) {
      // Case 1: Pickup + destinations → fit bounds
      map.fitBounds(bounds, 80);
    } else if (hasPickup) {
      // Case 2: Only pickup → zoom to pickup
      map.panTo(selectedPickup);
      map.setZoom(14);
    } else if (hasDests) {
      // Case 2b: Only destinations → zoom to them
      map.fitBounds(bounds, 80);
    } else if (hasPlace) { 
      map.panTo(selectedPlace)
      map.setZoom(14)
    } else {
      // Case 3: Neither → reset to default
      map.panTo({ lat: -37.840935, lng: 144.946457 });
      map.setZoom(12);
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
      map.panTo({ lat: -37.840935, lng: 144.946457 });
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

const MapSection = ({ selectedPlace, selectedPickup, destinations = [] }) => {
  // build polyline path: pickup -> dest1 -> dest2 ...

  const path = [
    ...(selectedPickup ? [selectedPickup] : []),
    ...destinations.filter(Boolean),
  ];

  const origin = selectedPickup;
  const destination = destinations[destinations.length - 1];
  const waypoints = destinations.slice(0, -1);

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
            destinations={destinations}
          />

          {/* Pickup marker */}
          {selectedPickup && (
            <AdvancedMarker position={selectedPickup}>
              <Pin background="orange" borderColor="white" glyphColor="white" />
            </AdvancedMarker>
          )}

          {/* Destination markers with numbers */}
          {destinations.map(
            (dest, idx) =>
              dest && (
                <AdvancedMarker key={idx} position={dest}>
                  <Pin
                    background="orange"
                    borderColor="white"
                    glyphColor="white"
                    scale={1.2}
                  >
                    <span className="text-white font-bold">{idx + 1}</span>
                  </Pin>
                </AdvancedMarker>
              )
          )}

          {/* Directions route */}
          {
           
            <DirectionsOverlay
              origin={origin}
              waypoints={waypoints}
              destination={destination}
            />
          }

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

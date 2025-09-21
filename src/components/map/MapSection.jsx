import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

const MapSection = () => {
  const position = { lat: 53.54, lng: 10 };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <div style={{ width: "100%", height: "100vh" }}>
        <Map
          defaultZoom={15}
          defaultCenter={position}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            gestureHandling: "greedy",
          }}
        />
      </div>
    </APIProvider>
  );
};

export default MapSection;

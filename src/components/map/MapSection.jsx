import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

const MapSection = () => {
    const position = {lat: 53.54, lng: 10};

  return <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
     <div style={{ width: "100%", height: "500px" }}> {/* ✅ container with height */}
        <Map zoom={9} center={position} mapId={"your-map-id"} />
      </div>
  </APIProvider>;
};

export default MapSection;

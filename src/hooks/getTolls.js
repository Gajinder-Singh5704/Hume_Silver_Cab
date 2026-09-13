import axios from "axios";

export const getTollInfo = async (origin,dest) => {
    // console.log(origin)
    // console.log(dest)
  const url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";

  const body = {
    origins: [
      {
        waypoint: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng
            }
          }
        }
      }
    ],
    destinations: [
      {
        waypoint: {
          location: {
            latLng: {
              latitude: dest.lat,
              longitude: dest.lng
            }
          }
        }
      }
    ],
    travelMode: "DRIVE",
    extraComputations: ["TOLLS"]
  };

  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": `${import.meta.env.VITE_GOOGLE_MAPS_KEY}`,
    "X-Goog-FieldMask":
      "originIndex,destinationIndex,travelAdvisory.tollInfo,duration,distanceMeters,status"
  };

  const response = await axios.post(url, body, { headers });
  return response.data;
}

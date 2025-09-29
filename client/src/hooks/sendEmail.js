import axios from "axios";

export const sendBooking = async (data) => {
  try {
    const res = await axios.post(
      "https://booking-details.onrender.com/api/booking/send-email",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data
  } catch (error) {
    console.log(error);
  }
};

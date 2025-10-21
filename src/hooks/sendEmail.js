import axios from "axios";

// export const sendBooking = async (data) => {
//   try {
//     const res = await axios.post(
//       "http://localhost:8083/api/booking/send-email",
//       data,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return res.data
//   } catch (error) {
//     console.log(error);
//   }
// };

// utils/sendBooking.js
import emailjs from "@emailjs/browser";

const isTesting = true
const publicKey = isTesting ? "Fvs3K2oVrfS-ia__Z" : "GP8oWDApS9Ak7Cv9B"
const emailTemplate = isTesting ? "template_i3s00iu" : "template_bk79vwl"
const serviceID = isTesting ? "service_tdo3otu" : "service_7fv1cj8"
const receiverEmail = isTesting ? "thakur.somu1998@gmail.com" :  "booking.hscs@yahoo.com"
emailjs.init(publicKey); // safe to expose


export const sendBooking = async (data) => {
  try {
    const templateParams = {
      email: receiverEmail,
      passengerName: data.passengerName,
      pickup: data.pickup,
      bookingMode: data.bookingMode,
      destination: data.destination,
      distance: data.distanceKm,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      timeType: data.timeType,
      passangers: data.passangers,
      selectedVichle: data.selectedVichle,
      fare: data.newFare,
      tolls: data.tolls ? "Yes" : "No"  ,
      contact: data.contact,
      paymantMethod: data.paymantMethod,
      note: data.note || "N/A",
      ipAddress: data.ipAddress
    };

    const res = await emailjs.send(
      serviceID,
      emailTemplate,
      templateParams
    );

    // EmailJS returns status 200 if ok
    if (res.status === 200) return { success: true, data: res };
    return { success: false, data: res };
  } catch (error) {
    console.error(error);
    return { success: false, message: error?.text || "EmailJS error" };
  }
};
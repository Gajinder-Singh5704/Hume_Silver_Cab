import nodemailer from "nodemailer";
import {nodemailerSecretes} from "../apiSecretes.js"
import { Resend } from "resend";

const resend = new Resend("re_N97TQ8ZC_33DRMhof2jKtkzU6ND7xfz8y")
// export const sendEmailController = async (req, res) => {
//   try {
//     const {
//      pickup,
//       destination,
//       tolls,
//       distanceKm,
//       selectedVichle,
//       passangers,
//       bookingMode,
//       fare,
//       pickupDate,
//       pickupTime,
//       passengerName,
//       contact,
//       paymantMethod,
//       note,
//       timeType,
//     } = req.body;

//    console.log("object")

//     const email = "thakur.somu1998@gmail.com";
//     const transporter = nodemailer.createTransport({
//        host: "smtp.gmail.com",
//   port: 465, // use 587 if TLS instead
//   secure: true,
//       auth: {
//         user: nodemailerSecretes.Email,
//         pass: nodemailerSecretes.Pass,
//       },
//     });
//     console.log(nodemailerSecretes.Email)

//     const mailOptions = {
//       from: nodemailerSecretes.Email,
//       to: email, // make sure this variable exists
//       subject: "Booking Request",
//       text: `
// Booking Request

// 1.Address
// Pickup : ${pickup}

// 2.Address
// Destination : ${destination}

// 3.Toll Road
// ${tolls}

// 4.Time Type
// ${timeType}

// 5.Distance (KM)
// ${distanceKm}

// 6.Type of Vehicle
// ${selectedVichle}

// 7.Number of passengers
// ${passangers}

// 8.Radio
// ${bookingMode}

// 9.Fixed Price
// ${fare}

// 10.Date
// ${pickupDate}

// 11.Time
// ${pickupTime}

// Proceed to Booking

// 12.Name
// ${passengerName}

// 13.Phone
// +61 ${contact}

// 14.Payment Method
// ${paymantMethod}

// 14.Driver Instruction
// ${note}
//   `,
//     };

//     console.log("object")

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return res.json({
//           success: false,
//           message:`Request Not Send ${error}`,
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Booking Request Send Successfully",
//       });
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       message: "Request Denied",
//     });
//   }
// };

export const sendEmailController = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      tolls,
      distanceKm,
      selectedVichle,
      passangers,
      bookingMode,
      fare,
      pickupDate,
      pickupTime,
      passengerName,
      contact,
      paymantMethod,
      note,
      timeType,
    } = req.body;

    const email = "thakur.somu1998@gmail.com";

    // Send email using Resend
    const response = await resend.emails.send({
      from: nodemailerSecretes.Email, // sender email
      to: email, // recipient email
      subject: "Booking Request",
      html: `
        <h2>Booking Request</h2>
        <p><strong>1. Pickup:</strong> ${pickup}</p>
        <p><strong>2. Destination:</strong> ${destination}</p>
        <p><strong>3. Toll Road:</strong> ${tolls}</p>
        <p><strong>4. Time Type:</strong> ${timeType}</p>
        <p><strong>5. Distance (KM):</strong> ${distanceKm}</p>
        <p><strong>6. Type of Vehicle:</strong> ${selectedVichle}</p>
        <p><strong>7. Number of passengers:</strong> ${passangers}</p>
        <p><strong>8. Booking Mode:</strong> ${bookingMode}</p>
        <p><strong>9. Fixed Price:</strong> ${fare}</p>
        <p><strong>10. Date:</strong> ${pickupDate}</p>
        <p><strong>11. Time:</strong> ${pickupTime}</p>
        <p><strong>12. Name:</strong> ${passengerName}</p>
        <p><strong>13. Phone:</strong> +61 ${contact}</p>
        <p><strong>14. Payment Method:</strong> ${paymantMethod}</p>
        <p><strong>15. Driver Instruction:</strong> ${note}</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Booking Request Sent Successfully",
      response,
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Request Not Sent: ${error.message}`,
    });
  }
};
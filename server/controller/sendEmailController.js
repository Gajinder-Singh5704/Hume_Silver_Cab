import nodemailer from "nodemailer";
import {nodemailerSecretes} from "../apiSecretes.js"
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

   console.log("object")

    const email = "sharmadivay31@gmail.com";
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: nodemailerSecretes.Email,
        pass: nodemailerSecretes.Pass,
      },
    });
    console.log(nodemailerSecretes.Email)

    const mailOptions = {
      from: nodemailerSecretes.Email,
      to: email, // make sure this variable exists
      subject: "Booking Request",
      text: `
       Booking Request

Address
Pickup : ${pickup}

Address
Destination : ${destination}

Toll Road
${tolls}

Time Type
${timeType}

Distance (KM)
${distanceKm}

Type of Vehicle
${selectedVichle}

Number of passengers
${passangers}

Radio
${bookingMode}

Fixed Price
${fare}

Date
${pickupDate}

Time
${pickupTime}

Proceed to Booking

Name
${passengerName}

Phone
+61 ${contact}

Payment Method
${paymantMethod}

Driver Instruction
${note}

  `,
    };

    console.log("object")

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.json({
          success: false,
          message: "Request Not Send",
        });
      }

      res.status(200).json({
        success: true,
        message: "Booking Request Send Successfully",
      });
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Request Denied",
    });
  }
};

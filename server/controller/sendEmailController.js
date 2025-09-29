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

    const email = "thakur.somu1998@gmail.com";
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

1.Address
Pickup : ${pickup}

2.Address
Destination : ${destination}

3.Toll Road
${tolls}

4.Time Type
${timeType}

5.Distance (KM)
${distanceKm}

6.Type of Vehicle
${selectedVichle}

7.Number of passengers
${passangers}

8.Radio
${bookingMode}

9.Fixed Price
${fare}

10.Date
${pickupDate}

11.Time
${pickupTime}

Proceed to Booking

12.Name
${passengerName}

13.Phone
+61 ${contact}

14.Payment Method
${paymantMethod}

14.Driver Instruction
${note}
  `,
    };

    console.log("object")

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.json({
          success: false,
          message:`Request Not Send ${error}`,
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

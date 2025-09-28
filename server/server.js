import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import emailRoute from "./routes/sendEmailRoutes.js"

dotenv.config()
const app = express()
const PORT = process.env.PORT|| 8083;

// allow json and data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "*"
    })
)

app.use("/api/booking",emailRoute)


app.listen(PORT,() => { 
  console.log("Servre is listening at",PORT);
});

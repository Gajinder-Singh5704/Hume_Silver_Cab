import express from "express"
import { sendEmailController } from "../controller/sendEmailController.js";


const router = express.Router();

// send email 
router.post("/send-email",sendEmailController);

export default router;
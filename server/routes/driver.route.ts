import express from "express";
import {
  sendingOtpToPhone,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
  sendingOtpToEmailDriver,
  verifyingEmailOtpDriver,
  getLoggedInDriverData,
} from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

// phone OTP
driverRouter.post("/send-otp", sendingOtpToPhone);
driverRouter.post("/login", verifyPhoneOtpForLogin);
driverRouter.post("/verify-otp", verifyPhoneOtpForRegistration);

// email OTP (driver)
driverRouter.post("/email-otp-request", sendingOtpToEmailDriver);
driverRouter.post("/email-otp-verify", verifyingEmailOtpDriver);

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

export default driverRouter;

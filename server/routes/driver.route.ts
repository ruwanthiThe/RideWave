import express from "express";
import {
  sendingOtpToPhone,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
  sendingOtpToEmailDriver,
  newRide,
  verifyingEmailOtpDriver,
  getLoggedInDriverData,
  updateDriverStatus,
  getDriversById,
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

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);



export default driverRouter;

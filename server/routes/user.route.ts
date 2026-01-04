import express from "express";
import {
  getLoggedInUserData,
  registerUser,
  sendingOtpToEmail,
  signupNewUser,
  verifyingEmail,
  verifyOtp,
} from "../controllers/user.controller";

import { isAuthenticated } from "../middleware/isAuthenticated";

const userRouter = express.Router();

userRouter.post("/registration", registerUser);

userRouter.post("/verify-otp", verifyOtp); // added route for OTP verification

userRouter.put("/sign-up-user", signupNewUser);

userRouter.post("/email-otp-request",sendingOtpToEmail);

userRouter.put("/email-otp-verify",verifyingEmail);

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

export default userRouter;

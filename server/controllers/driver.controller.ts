require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/send-token";

/**
 * DEV ONLY: in-memory OTP store
 */
const phoneOtpStore = new Map<string, string>();

// ==========================
// SEND OTP TO PHONE (DEV)
// ==========================
export const sendingOtpToPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ success: false, message: "Phone number required" });

    const otp = "3271"; // DEV
    phoneOtpStore.set(phone_number, otp);
    console.log(`📲 DEV OTP for ${phone_number} => ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent (DEV MODE)" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false });
  }
};

// ==========================
// VERIFY PHONE OTP FOR LOGIN
// ==========================
export const verifyPhoneOtpForLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    const savedOtp = phoneOtpStore.get(phone_number);
    if (!savedOtp || savedOtp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    phoneOtpStore.delete(phone_number);

    const driver = await prisma.driver.findUnique({ where: { phone_number } });
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    sendToken(driver, res);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false });
  }
};

// ==========================
// VERIFY PHONE OTP FOR REGISTRATION
// ==========================
export const verifyPhoneOtpForRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    const savedOtp = phoneOtpStore.get(phone_number);
    if (!savedOtp || savedOtp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    phoneOtpStore.delete(phone_number);

    res.status(201).json({ success: true, message: "Phone number verified" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false });
  }
};

// ==========================
// SEND OTP TO DRIVER EMAIL
// ==========================
export const sendingOtpToEmailDriver = async (req: Request, res: Response) => {
  try {
    const { name, email, phone_number, country, vehicle_type, registration_number, registration_date, driving_license, vehicle_color, rate } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // driver data for JWT
    const driver = { name, email, phone_number, country, vehicle_type, registration_number, registration_date, driving_license, vehicle_color, rate };

    const token = jwt.sign({ driver, otp }, process.env.EMAIL_ACTIVATION_SECRET!, { expiresIn: "5m" });

    // Send OTP via Nylas
    await nylas.messages.send({
      identifier: process.env.USER_GRANT_ID!, // same as user
      requestBody: {
        to: [{ name, email }],
        subject: "Verify your RideWave email",
        body: `
          <p>Hi ${name},</p>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This OTP is valid for 5 minutes.</p>
          <p>Thanks,<br/>RideWave Team</p>
        `,
      },
    });

    console.log(`OTP sent to driver ${email}: ${otp}`); // for debugging

    res.status(201).json({ success: true, token });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================
// VERIFY DRIVER EMAIL OTP
// ==========================
export const verifyingEmailOtpDriver = async (req: Request, res: Response) => {
  try {
    const { otp, token } = req.body;
    const newDriver: any = jwt.verify(token, process.env.EMAIL_ACTIVATION_SECRET!);

    if (newDriver.otp !== otp) {
      return res.status(400).json({ success: false, message: "OTP is not correct or expired!" });
    }

    const driver = await prisma.driver.create({ data: newDriver.driver });
    sendToken(driver, res);
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: "OTP verification failed" });
  }
};

// get logged in driver data
export const getLoggedInDriverData = async (req: any, res: Response) => {
  try {
    const driver = req.driver;

    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.log(error);
  }
};

// updating driver status
export const updateDriverStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.id!,
      },
      data: {
        status,
      },
    });
    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

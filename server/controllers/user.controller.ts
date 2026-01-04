require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken, { lazyLoading: true });
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/send-token";


// register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // ✅ Generate 4-digit OTP (since frontend uses 4 boxes)
    let otp: number = Math.floor(1000 + Math.random() * 9000);

    // allow using a fixed dev-only OTP when DEV_FIXED_OTP is set
    if (process.env.NODE_ENV !== "production" && process.env.DEV_FIXED_OTP) {
      const fixed = Number(process.env.DEV_FIXED_OTP);
      if (!Number.isNaN(fixed) && fixed >= 0 && fixed <= 9999) {
        otp = fixed;
        console.log(`[DEV] Using fixed OTP ${otp} for ${phone_number}`);
      } else {
        console.warn(
          `[DEV] DEV_FIXED_OTP is invalid: ${process.env.DEV_FIXED_OTP}; falling back to random OTP`,
        );
      }
    }

    // =========================
    // ✅ DEVELOPMENT MODE
    // =========================
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] OTP for ${phone_number}: ${otp}`);

      return res.status(200).json({
        success: true,
        message: "OTP generated (SMS skipped in dev)",
        otp, // 👈 send OTP to frontend
      });
    }

    // =========================
    // ✅ PRODUCTION MODE
    // =========================
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID!)
      .verifications.create({
        channel: "sms",
        to: phone_number,
      });

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



// verify otp (DEV + PROD SAFE)
export const verifyOtp = async (
  req: Request,
  res: Response
) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP required",
      });
    }

    // ======================
    // ✅ DEV MODE (NO TWILIO)
    // ======================
    if (process.env.NODE_ENV !== "production") {
      if (otp !== process.env.DEV_FIXED_OTP) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // check user
      let user = await prisma.user.findUnique({
        where: { phone_number },
      });

      if (!user) {
        try {
          user = await prisma.user.create({
            data: { phone_number },
          });
        } catch (err: any) {
          // Handle unique constraint races or index issues gracefully
          if (err?.code === "P2002") {
            console.warn(
              "Prisma P2002 during user.create — attempting to recover",
              err.meta,
            );

            // 1) Try exact phone_number
            user = await prisma.user.findUnique({ where: { phone_number } });

            // 2) Try normalized variants (+/-)
            if (!user) {
              const altNumbers: string[] = [];
              if (phone_number.startsWith("+")) altNumbers.push(phone_number.slice(1));
              else altNumbers.push(`+${phone_number}`);

              for (const n of altNumbers) {
                user = await prisma.user.findUnique({ where: { phone_number: n } });
                if (user) break;
              }
            }

            // 3) Try contains lookup for last digits (helps when formats differ)
            if (!user) {
              const digits = phone_number.replace(/\D/g, "");
              const last9 = digits.slice(-9);
              if (last9) {
                user = await prisma.user.findFirst({
                  where: { phone_number: { contains: last9 } },
                });
              }
            }

            // 4) Last resort: try upsert (create if not found) to reduce race conditions
            if (!user) {
              try {
                user = await prisma.user.upsert({
                  where: { phone_number },
                  update: {},
                  create: { phone_number },
                });
              } catch (upsertErr: any) {
                console.error("Recovery upsert failed after P2002", upsertErr);

                // If upsert failed due to email unique constraint, try creating with a placeholder email
                if (upsertErr?.code === "P2002" && upsertErr?.meta?.target?.toString().includes("email")) {
                  const placeholderEmail = `__no_email_${Date.now()}_${Math.floor(Math.random() * 10000)}@no-reply.local`;
                  console.warn("Attempting to create user with placeholder email to avoid email unique constraint", placeholderEmail);
                  try {
                    user = await prisma.user.create({ data: { phone_number, email: placeholderEmail } });
                  } catch (createErr: any) {
                    console.error("Failed to create user with placeholder email after P2002", createErr);
                    return res.status(500).json({
                      success: false,
                      message: "User creation failed due to unique constraint; please try again",
                    });
                  }
                } else {
                  return res.status(500).json({
                    success: false,
                    message:
                      "User creation failed due to unique constraint; please try again",
                  });
                }
              }
            }

            if (!user) {
              // if still not found, return a clear error
              return res.status(500).json({
                success: false,
                message:
                  "User creation failed due to unique constraint; please try again",
              });
            }
          } else {
            throw err;
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        user,
      });
    }

    // ======================
    // ✅ PRODUCTION (TWILIO)
    // ======================
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID!)
      .verificationChecks.create({
        to: phone_number,
        code: otp,
      });

    let user = await prisma.user.findUnique({
      where: { phone_number },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone_number },
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

//signup new user
export const signupNewUser = async (req: Request, res: Response,next: NextFunction) => {
  try{
    const{userId,email,name}=req.body;
    const user=await prisma.user.findUnique({
      where:{id:userId}
    });
    if(user?.email===null){
      const updatedUser =await prisma.user.update({
        where:{id:userId},
        data:{
          name:name,
          email:email
        },
      });
      res.status(200).json({
        success:true,
        user:updatedUser
      }); 
    }else{
      res.status(400).json({
        success:false,
        message:"User already existing",
      })
    }

  }catch(error){
    console.log(error);
  }
}

export const sendingOtpToEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, name, userId } = req.body;

    // DEV MODE — skip Nylas
    if (process.env.NODE_ENV !== "production") {
      const otp = "1234"; // fixed dev OTP
      const token = jwt.sign(
        { user: { userId, name, email }, otp },
        process.env.EMAIL_ACTIVATION_SECRET!,
        { expiresIn: "10m" }
      );

      console.log(`[DEV] Email OTP for ${email}: ${otp}`);

      return res.status(200).json({
        success: true,
        token,
      });
    }

    // PROD MODE — real email
    // (keep your existing Nylas code here)

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Email OTP failed",
    });
  }
};


// verifying email otp
export const verifyingEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, token } = req.body;

    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not correct or expired!",
      });
    }

    const { name, email, userId } = newUser.user;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user?.email === null) {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: name,
          email: email,
        },
      });
      await sendToken(updatedUser, res);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
    
  }
};

// get logged in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};
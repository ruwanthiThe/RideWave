import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import SignInText from "@/components/login/signin.text";
import { windowHeight } from "@/themes/app.constant";
import OTPTextInput from "react-native-otp-textinput";
import color from "@/themes/app.colors";
import { style } from "./style";
import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

export default function OtpVerificationScreen() {
  const { otp,phone } = useLocalSearchParams();
  const toast = useToast();
  const [code, setCode] = useState("");

  // debug: log route param for OTP
  useEffect(() => {
    console.log("route otp param:", otp);
  }, [otp]);

  // ✅ Auto-fill OTP in DEV
  useEffect(() => {
    if (__DEV__ && otp) {
      setCode(String(otp));
    }
  }, [otp]);



const handleVerify = async () => {
  if (!code) {
    toast.show("Please enter OTP", { placement: "bottom" });
    return;
  }

  try {
    const baseUrl = (process.env.EXPO_PUBLIC_SERVER_URI || "").replace(/\/$/, "");
    const url = `${baseUrl}/verify-otp`;
    console.log("Calling verify endpoint:", url, { phone, otp: code });

    const res = await axios.post(url, {
      phone_number: phone,
      otp: code,
    });

    console.log("verify response:", res.data);

    if (res.data.success) {
      toast.show("OTP verified!");

      // navigate to registration with the returned user to pre-fill phone
      const user = res.data.user;
      if (user) {
        router.push({
          pathname: "/(routes)/registration",
          params: { user: JSON.stringify(user) },
        });
      } else {
        // fallback: go to home
        router.push("/(tabs)/home");
      }
    } else {
      toast.show(res.data.message || "Invalid OTP", {
        type: "danger",
        placement: "bottom",
      });
    }
  } catch (error: any) {
    console.log("verify error:", error?.response?.data || error);
    toast.show("Invalid OTP", {
      type: "danger",
      placement: "bottom",
    });
  }
};


  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"OTP Verification"}
            subtitle={"Check your phone number for the otp!"}
          />

          <OTPTextInput
            handleTextChange={(val) => setCode(val)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
          />

          <View style={[external.mt_30]}>
            <Button title="Verify" onPress={handleVerify} />
          </View>

          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", gap: 5, justifyContent: "center" },
              ]}
            >
              <Text style={[commonStyles.regularText]}>
                Not Received yet?
              </Text>
              <TouchableOpacity>
                <Text style={[style.signUpText, { color: "#000" }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}

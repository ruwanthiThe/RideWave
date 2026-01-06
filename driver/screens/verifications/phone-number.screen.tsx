import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import SignInText from "@/components/login/signin.text";
import Button from "@/components/common/button";
import { external } from "@/styles/external.style";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import color from "@/themes/app.colors";
import OTPTextInput from "react-native-otp-textinput";
import { style } from "./style";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";

const SERVER = process.env.EXPO_PUBLIC_SERVER_URI;

export default function PhoneNumberVerificationScreen() {
  const { phone_number } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const driver = useLocalSearchParams();
  const [loader, setLoader] = useState(false);

  const handleSubmit = async () => {
    try {
      await axios.post(`${SERVER}/driver/verify-otp`, {
        phone_number,
        otp,
      });

      Toast.show("Phone verified successfully", { type: "success" });
      router.push({
        pathname: "/(routes)/email-verification",
        params: driver,
      });
      
    } catch (error) {
      Toast.show("Invalid OTP", { type: "danger" });
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Phone Number Verification"}
            subtitle={"Enter the 4 digit OTP"}
          />

          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={false}
          />

          <View style={[external.mt_30]}>
            <Button
              title="Verify"
              height={windowHeight(30)}
              onPress={handleSubmit}
              disabled={loader}
            />
          </View>

          <View style={[external.mb_15]}>
            <Text
              style={[
                commonStyles.regularText,
                { textAlign: "center", marginTop: 10 },
              ]}
            >
              
            </Text>
          </View>
        </View>
      }
    />
  );
}

import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/auth-container";
import { windowHeight } from "@/themes/app.constant";
import styles from "./styles";
import Images from "@/utils/images";
import SignInText from "@/components/login/signin.text";
import { external } from "@/styles/external.style";
import PhoneNumberInput from "@/components/login/phone-number.input";
import Button from "@/components/common/button";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

export default function LoginScreen() {
  const [phone_number, setphone_number] = useState("");
  const [loading, setloading] = useState(false);
  const [countryCode, setCountryCode] = useState("+94");
  const toast = useToast();

   const handleSubmit = async () => {
  if (phone_number === "" || countryCode === "") {
    toast.show("Please fill the fields!", { placement: "bottom" });
    return;
  }

  setloading(true);

  const phoneNumber = `${countryCode}${phone_number}`;

  try {
    const baseUrl = (process.env.EXPO_PUBLIC_SERVER_URI || "").replace(/\/$/, "");
    if (!baseUrl) console.warn("EXPO_PUBLIC_SERVER_URI is not set");
    const url = `${baseUrl}/registration`;
    console.log("Calling OTP endpoint:", url, phoneNumber);

    const res = await axios.post(url, { phone_number: phoneNumber });
    console.log("OTP response:", res.data);

    if (res.data.success) {
      router.push({
        pathname: "/otp-verification",
        params: {
          phone: phoneNumber,
          otp: res.data.otp || "", // 👈 OTP comes only in dev
        },
      });
    }
  } catch (error) {
    console.log(error);
    toast.show("Something went wrong", { placement: "bottom" });
  } finally {
    setloading(false);
  }
};



  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
          <View>
            <View>
              <Image style={styles.transformLine} source={Images.line} />
              <SignInText />
              <View style={[external.mt_25, external.Pb_10]}>
                <PhoneNumberInput
                  phone_number={phone_number}
                  setphone_number={setphone_number}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                />
                <View style={[external.mt_25, external.Pb_15]}>
                  <Button
                    title="Get Otp"
                    onPress={() => handleSubmit()}
                    disabled={loading}
                    
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    />
  );
}

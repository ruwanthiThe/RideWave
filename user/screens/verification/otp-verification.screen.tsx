import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import AuthContainer from '@/utils/container/auth-container'
import SignInText from '@/components/login/signin.text'
import { windowHeight } from '@/themes/app.constant'
import OTPTextInput from "react-native-otp-textinput";
import color from '@/themes/app.colors'
import { style } from "./style";

import { external } from "@/styles/external.style";
import Button from "@/components/common/button";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";


export default function OtpVerificationScreen() {
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
            handleTextChange={(code) => console.log(code)}
            inputCount={4}
            textInputStyle={style.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={false}
          />

        <View style={[external.mt_30]}>
            <Button
              title="Verify"
              onPress={() => router.push('/(tabs)/home')}
            />
        </View>
        <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", gap: 5, justifyContent: "center" },
              ]}
            >
              <Text style={[commonStyles.regularText]}>Not Received yet?</Text>
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
  )
}
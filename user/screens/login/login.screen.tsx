import { View, Text } from 'react-native'
import React from 'react'
import AuthContainer from '@/utils/container/auth-container'
import { windowHeight } from '@/themes/app.constant'

export default function LoginScreen() {
  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
         
        </View>
      }
    />
  )
}
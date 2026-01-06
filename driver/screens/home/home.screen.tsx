import { View, Text } from 'react-native'
import React from 'react'
import Header from '@/components/common/header';
import styles from './sty;es';
import { useTheme } from '@react-navigation/native';

import { rideData } from '@/configs/constants';


export default function HomeScreen() {
  const [isOn, setIsOn] = React.useState(false);
  const { colors } = useTheme();
  const toggleSwitch = () => {
    setIsOn(!isOn);
  };
   return (
    <View style={styles.container}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={toggleSwitch} />
         
      </View>
    </View>
  )
}
import {
  View,
  Text,
  
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";

import Header from '@/components/common/header';
import styles from './styles';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { rideData } from '@/configs/constants';
import RideCard from "@/components/ride/ride.card";
import { recentRidesData } from "@/configs/constants";
import RenderRideItem from "@/components/ride/render.ride.item";
import { FlatList } from "react-native";
import { external } from "@/styles/external.style";


export default function HomeScreen() {
  const [isOn, setIsOn] = React.useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const { colors } = useTheme();
  const toggleSwitch = () => {
    setIsOn(!isOn);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };
   return (
    <View style={styles.container}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={toggleSwitch} />
         <FlatList
          data={rideData}
          numColumns={2}
          renderItem={({ item }) => (
            <RenderRideItem item={item} colors={colors} />
          )}
        />

        <View style={[styles.rideContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.rideTitle, { color: colors.text }]}>
            Recent Rides
          </Text>
          <FlatList
            data={recentRidesData}
            renderItem={({ item }) => <RideCard item={item} />}
          />
        </View>
         
      </View>
      <Modal 
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
      
      >

        <TouchableOpacity
        style={styles.modalBackground}
        onPress={handleClose}
        activeOpacity={1}
        >
          <TouchableOpacity>
            
          </TouchableOpacity>

        </TouchableOpacity>

      </Modal>
    </View>
  )
}
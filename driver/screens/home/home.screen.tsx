import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/common/header";
import { recentRidesData, rideData } from "@/configs/constants";
import { useTheme } from "@react-navigation/native";
import RenderRideItem from "@/components/ride/render.ride.item";
import { external } from "@/styles/external.style";
import styles from "./styles";
import RideCard from "@/components/ride/ride.card";
import MapView, { Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Gps, Location } from "@/utils/icons";
import color from "@/themes/app.colors";
import Button from "@/components/common/button";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as GeoLocation from "expo-location";
import { Toast } from "react-native-toast-notifications";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";


import { router } from "expo-router";


export default function HomeScreen() {
  const { driver, loading: DriverDataLoading } = useGetDriverData();
  const notificationListener = useRef<any>();
  const [isOn, setIsOn] = React.useState<any>(false);
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [wsConnected, setWsConnected] = useState(false);
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [distance,setdistance] = useState<any>();
  const [lastLocation,setLastLocation] = useState<any>(null);
  const [currentLocationName, setcurrentLocationName] = useState("");
  const [destinationLocationName, setdestinationLocationName] = useState("");

  const ws = new WebSocket("ws://192.168.1.7:5000");

  const { colors } = useTheme();


  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

    useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Handle the notification and extract data
        const orderData = JSON.parse(
          notification.request.content.data.orderData
        );
        setIsModalVisible(true);
        setCurrentLocation({
          latitude: orderData.currentLocation.latitude,
          longitude: orderData.currentLocation.longitude,
        });
        setMarker({
          latitude: orderData.marker.latitude,
          longitude: orderData.marker.longitude,
        });
        setRegion({
          latitude:
            (orderData.currentLocation.latitude + orderData.marker.latitude) /
            2,
          longitude:
            (orderData.currentLocation.longitude + orderData.marker.longitude) /
            2,
          latitudeDelta:
            Math.abs(
              orderData.currentLocation.latitude - orderData.marker.latitude
            ) * 2,
          longitudeDelta:
            Math.abs(
              orderData.currentLocation.longitude - orderData.marker.longitude
            ) * 2,
        });
        setdistance(orderData.distance);
        setcurrentLocationName(orderData.currentLocationName);
        setdestinationLocationName(orderData.destinationLocation);
        //setUserData(orderData.user);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, []);






  useEffect(() => {
    const fetchStatus = async () => {
      const status = await AsyncStorage.getItem("status");
      setIsOn(status === "active" ? true : false);
      
    };
    fetchStatus();
  }, []);


   // socket updates
  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setWsConnected(true);
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("Received message:", message);
      // Handle received location updates here
    };

    ws.onerror = (e: any) => {
      console.log("WebSocket error:", e.message);
    };

    ws.onclose = (e) => {
      console.log("WebSocket closed:", e.code, e.reason);
    };

    return () => {
      ws.close();
    };
  }, []);



    useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Toast.show("Failed to get push token for push notification!", {
          type: "danger",
        });
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        Toast.show("Failed to get project id for push notification!", {
          type: "danger",
        });
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        // return pushTokenString;
      } catch (e: unknown) {
        Toast.show(`${e}`, {
          type: "danger",
        });
      }
    } else {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
    }
  }
   const sendLocationUpdate = async (location: any) => {
     if (ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
              type: "locationUpdate",
              data: location,
              role: "driver",
              driver: driver?.id,
            });
            ws.send(message);
          }
   };



    useEffect(() => {
    (async () => {
      let { status } = await GeoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show("Please give us to access your location to use this app!");
        return;
      }

      await GeoLocation.watchPositionAsync(
        {
          accuracy: GeoLocation.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          if(driver && wsConnected){
            sendLocationUpdate({ latitude, longitude } );
          }
        }
      );
    })();
  }, [driver]);


  
  const handleClose = () => {
    setIsModalVisible(false);
  };

   const handleStatusChange = async () => {
   await AsyncStorage.getItem("status");
    
    if (!loading) {
      setloading(true);
      const accessToken = await AsyncStorage.getItem("accessToken");
      const changeStatus = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/update-status`,
        {
          status: !isOn ? "active" : "inactive",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (changeStatus.data) {
        setIsOn(!isOn);
        
        await AsyncStorage.setItem("status", changeStatus.data.driver.status);
        setloading(false);
      } else {
        setloading(false);
      }
    }
  };


   return (
    <View style={styles.container}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={()=> handleStatusChange()} />
         <FlatList
          data={rideData}
          numColumns={2}
          renderItem={({ item }) => (
            <RenderRideItem item={item} colors={colors} />
          )}
        />

        <View style={[styles.rideContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.rideTitle, { color: colors.text }]}
          onPress={()=>setIsModalVisible(true)}
          >
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
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
            <View>
              <Text style={styles.modalTitle}>New Ride Request Received!</Text>
              <MapView
                style={{ height: windowHeight(180) }}
                region={region}
                onRegionChangeComplete={(region) => setRegion(region)}
              >
                {marker && <Marker coordinate={marker} />}
                {currentLocation && <Marker coordinate={currentLocation} />}
                {currentLocation && marker && (
                  <MapViewDirections
                    origin={currentLocation}
                    destination={marker}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                    strokeWidth={4}
                    strokeColor="blue"
                  />
                )}
              </MapView>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.leftView}>
                  <Location color={colors.text} />
                  <View
                    style={[
                      styles.verticaldot,
                      { borderColor: color.buttonBg },
                    ]}
                  />
                  <Gps colors={colors.text} />
                </View>
                <View style={styles.rightView}>
                  <Text style={[styles.pickup, { color: colors.text }]}>
                    Green line bus stand,Rajar Bag,Dhaka{""}
                  </Text>
                  <View style={styles.border} />
                  <Text style={[styles.drop, { color: colors.text }]}>
                    Gulshan 3,Road no 5,Block C,Dhaka
                  </Text>
                </View>
                </View>
                 <Text
                style={{
                  paddingTop: windowHeight(5),
                  fontSize: windowHeight(14),
                }}
              >
                Distance: 9.4 km
              </Text>
              <Text
                style={{
                  paddingVertical: windowHeight(5),
                  paddingBottom: windowHeight(5),
                  fontSize: windowHeight(14),
                }}
              >
                Amount:138 BDT
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: windowHeight(5),
                }}
              >
                <Button
                  title="Decline"
                  onPress={handleClose}
                  width={windowWidth(120)}
                  height={windowHeight(30)}
                  backgroundColor="crimson"
                />
                <Button
                  title="Accept"
                  
                  width={windowWidth(120)}
                  height={windowHeight(30)}
                />
              </View>
            </View>

          </TouchableOpacity>

        </TouchableOpacity>

      </Modal>
    </View>
  )
}
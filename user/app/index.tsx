import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function index() {
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    

    const getData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          setisLoggedIn(true);
        }else{
          setisLoggedIn(false);
        }
      } catch (error) {
        console.log("Failed to retrieve access token from async storage", error);
      } finally {
        
          setisLoading(false);
        }
      };
      getData();
    }, []);

    if(isLoading){
      return null; // or a loading spinner
    }

    


  return (
    <Redirect href={!isLoggedIn ? "/(routes)/onboarding" : "/(tabs)/home"} />
  );
}

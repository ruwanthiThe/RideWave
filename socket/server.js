const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();

// REST API port (safe)
const PORT = 4000;

// WebSocket port (safe for Expo)
const WS_PORT = 5000;

// Store driver locations
let drivers = {};

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);

wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received message:", data);

      // DRIVER sends location
      if (data.type === "locationUpdate" && data.role === "driver") {
        drivers[data.driver] = {
          latitude: data.data.latitude,
          longitude: data.data.longitude,
        };

        console.log(
          "Updated driver location:",
          data.driver,
          drivers[data.driver]
        );
      }

      // USER requests ride
      if (data.type === "requestRide" && data.role === "user") {
        console.log("Requesting ride...");

        const nearbyDrivers = findNearbyDrivers(
          data.latitude,
          data.longitude
        );

        ws.send(
          JSON.stringify({
            type: "nearbyDrivers",
            drivers: nearbyDrivers,
          })
        );
      }
    } catch (error) {
      console.log("Failed to parse WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Find drivers within 5km
const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5 km
    })
    .map(([id, location]) => ({
      id,
      latitude: location.latitude,
      longitude: location.longitude,
    }));
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

# Ridex – Real-Time Car Booking Mobile App 

**RideWave** is a comprehensive, full-stack ride-sharing application built to provide a seamless experience for both passengers and drivers, similar to Uber. It leverages real-time location tracking, secure authentication, and a robust backend to manage ride requests and completions.

## 🚀 Project Overview

This project is a mobile application developed using **Expo React Native**. It features two distinct interfaces: one for passengers to book rides and another for drivers to accept and manage those rides.

### Key Features

* **Real-Time GPS Tracking:** Uses Google Maps API to track exact locations of drivers and passengers in real-time
* **Dual App Functionality:** Integrated screens for both Passenger (User) and Driver roles.
* **Secure Authentication:** - Mobile number login with **OTP Verification**.
* **Email Verification** for added security.


* **Dynamic Ride Booking:** Passengers can select destinations, view distance/time estimates, and confirm bookings.
* **Driver Management:** Drivers can register their vehicles (type, registration number, color) and set their own **rate per kilometer**.
* **Ride History:** Users can view their recent rides and trip details.
* **Interactive UI:** Features a beautiful onboarding swiper and modern, responsive design.

## 🛠️ Tech Stack

* **Frontend:** [Expo](https://expo.dev/) (React Native) with TypeScript.
* **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/).
* **Database:** [MongoDB](https://www.mongodb.com/) with **Prisma ORM**.
* **Maps & Location:** 
* **Styling:** Custom CSS-in-JS for consistent theming .
* **State Management:** React Hooks (useState, useEffect) and Context API.


## ⚙️ Installation & Setup

### 1. Prerequisites

* Node.js installed.
* Expo Go app on your physical device.
* MongoDB Atlas account.

### 2. Backend Setup

1. Navigate to the server directory.
2. Install dependencies: `npm install`.
3. Configure your `.env` file with `DATABASE_URL` (MongoDB) and `PORT` (e.g., 8000).
4. Run the server:
```bash
npm run dev

```


*The server should connect to Port 8000.*

### 3. Frontend Setup

1. Navigate to the app directory.
2. Install dependencies: `npm install`.
3. Add your **Google Maps API Key** to your configuration files.
4. Start the Expo project:
```bash
npx expo start

```



## 📝 Important Notes

* **Testing:** This app should be tested on a **physical device** because simulators/emulators cannot accurately simulate real-time location movement required for the ride-tracking logic.
* **Prisma:** Ensure you run `npx prisma generate` after modifying the `schema.prisma` file to keep your database client in sync.

---


# Smart College Bus Tracking System 🚌📍

A modern, responsive, full-stack college bus tracking web application built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Express.js**, **Socket.IO**, and **Google Maps API** (with dynamic vector fallback mode).

---

## 🌟 Key Features

1. **Animated Multi-Role Landing Page**:
   - **Admin Login**: Sleek slide/fade transition to Admin Console.
   - **Driver Login**: Animated college bus drives from the left edge to the center, pulling/revealing the Driver Login Panel.
   - **Student Login**: Animated bus traverses a route to a GPS pin marker before revealing the Student Login Panel.

2. **Admin Control Dashboard (`/admin/dashboard`)**:
   - Overview Stat Cards: Total Buses, Active Trips, Drivers, Students, Telemetry, and Reported Issues.
   - Bus CRUD Management: Configure bus numbers, route stops, driver assignments, speed limits, and journey duration.
   - Driver & Student Management: Generate secret keys, reset passwords, assign buses, and track active sessions.
   - Emergency Issue Reports: Review breakdown/traffic reports submitted by drivers, mark as resolved, or delete.

3. **Driver Telemetry Console (`/driver/dashboard`)**:
   - Start/Stop trip controls.
   - Continuous browser GPS geolocation tracking (latitude, longitude, live speed).
   - Demo simulation mode toggle for testing offline/without mobile device GPS.
   - Estimated journey countdown timer with automatic trip auto-stop.
   - Emergency Issue Reporting form (auto-attaches driver ID, bus number, timestamp, and GPS coordinates).

4. **Student Live Tracking (`/student/dashboard`, `/student/track/:busId`)**:
   - Available bus directory with search and live/inactive filters.
   - Live Bus Tracking View with smooth marker movement, stop schedule timeline, speed indicator, and ETA predictions.

5. **Google Maps Integration & Demo Fallback**:
   - Native Google Maps JavaScript API integration using `@react-google-maps/api`.
   - Dynamic Interactive Vector Map Mode when `VITE_GOOGLE_MAPS_API_KEY` is omitted or unconfigured.

---

## 🔑 Quick Demo Credentials

| Role | Username / ID | Password | Secret Key |
| :--- | :--- | :--- | :--- |
| **Admin** | `ADM-101` | `admin123` | N/A |
| **Driver** | `DRV-01` | `driver123` | `SEC-DRV-01` |
| **Student** | `21001A0501` | `student123` | `SEC-STU-01` |

---

## ⚙️ Tech Stack & Prerequisites

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React Icons
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Supabase PostgreSQL Schema (`supabase/schema.sql`) + LocalStorage Fallback

---

## 🚀 Quick Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, insert your Google Maps API key if available:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
VITE_API_URL=http://localhost:5000
PORT=5000
```
*(If left empty or unchanged, the application operates in **Interactive Vector Map Demo Mode**).*

### 3. Run Development Servers
To run both the Vite React Frontend and Express Socket Backend concurrently:
```bash
npm run dev        # Starts Vite Frontend at http://localhost:5173
npm run server     # Starts Express & Socket.IO Backend at http://localhost:5000
```

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Open your Supabase SQL Editor or PostgreSQL workbench.
2. Run the SQL script located in `supabase/schema.sql`.
3. The script creates tables for `admins`, `drivers`, `students`, `buses`, `bus_stops`, `trips`, `bus_locations`, and `reports`.

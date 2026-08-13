# 🎓 RuinMIT - Everything you need on campus. In one place.

> A comprehensive student utility platform designed exclusively for MIT-WPU students to manage campus life, from side-hustles and carpooling to finding flatmates and recovering lost items.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-000000?style=for-the-badge)

---

## 📖 Overview

**RuinMIT** is a full-stack platform built by students, for students. It centralizes essential campus activities into a single, cohesive, dark-themed web application. Whether you're looking to earn extra cash doing small tasks, share a ride to campus, sell old textbooks, or find a compatible flatmate, RuinMIT provides the marketplace to connect with your peers.

### ✨ Core Features

- 💸 **Gig Board** — Post or pick up small paid tasks (assignments, tutoring, design) from fellow students.
- 🚗 **Rides** — Share rides to and from campus, split fares, and reduce travel costs.
- 🛒 **Marketplace** — Buy and sell second-hand items like electronics, furniture, and study materials locally.
- 🤝 **Flatmates** — Browse and post housing listings, filter by budget and lifestyle preferences (e.g., diet, gender preference).
- 🔍 **Lost & Found** — A centralized digital bulletin board to report lost items or return found ones.
- 💬 **Real-Time Chat** — Integrated WebSocket-based messaging system to negotiate gigs, coordinate rides, or discuss marketplace items instantly.
- 🔔 **Push Notifications** — Real-time alerts for messages, gig applications, and ride bookings.

---

## 🏗️ Tech Stack

### Frontend
- **React 19** (Vite)
- **React Router 7** for navigation
- **Tailwind CSS** & **Framer Motion** for styling and smooth animations
- **Axios** for REST API calls
- **SockJS & StompJS** for real-time WebSocket communication
- Context API for State Management (Auth, Chat)

### Backend
- **Java 17** & **Spring Boot**
- **Spring Security & JWT** for robust authentication
- **Spring Data JPA** (Hibernate) for database ORM
- **Spring WebSockets** for real-time chat and notifications
- **PostgreSQL** (hosted on Neon.tech) as the primary database
- **Brevo API** for sending verification and password-reset emails
- **Cloudinary API** for seamless image uploads and management

---

## 📁 Project Structure

```
RUIN-MIT/
│
├── frontend/                     # React 19 / Vite Application
│   ├── src/
│   │   ├── api/                  # Axios service layers (gigService, rideService, etc.)
│   │   ├── components/           # Reusable UI, Layout, and Feature components
│   │   ├── context/              # Global state (AuthContext, ChatContext)
│   │   ├── pages/                # Route-level components (Landing, Gigs, Rides, etc.)
│   │   ├── App.jsx               # Main application router
│   │   └── main.jsx              # Application entry point
│   ├── tailwind.config.js        # Custom RuinMIT design tokens and colors
│   └── package.json
│
└── backend/                      # Spring Boot REST API
    ├── src/main/java/com/RuinMIT/
    │   ├── config/               # Security, WebSocket, Cloudinary configs
    │   ├── controller/           # REST endpoints mapping
    │   ├── dto/                  # Data Transfer Objects (Requests/Responses)
    │   ├── entity/               # JPA Database entities
    │   ├── repository/           # Spring Data JPA interfaces
    │   ├── security/             # JWT filters and auth services
    │   └── service/              # Core business logic
    └── src/main/resources/
        └── application.properties # Environment variables and app configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Java JDK** (17+)
- **Maven** (3.8+)
- PostgreSQL database
- API Keys for Cloudinary and Brevo (Sendinblue)

### 1️⃣ Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**
   Set the following environment variables (or update `application.properties`):
   ```properties
   DB_URL=jdbc:postgresql://your-db-host/ruinmit
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_base64_encoded_256_bit_secret
   BREVO_API_KEY=your_brevo_api_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Run the Application**
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8089`.

### 2️⃣ Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**
   Create a `.env` file in the `frontend` root:
   ```env
   VITE_DEV_API_URL=http://localhost:8089
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## 🔌 Core APIs

The backend exposes several modular REST endpoints:

- `/api/auth/**` - Login, Registration, Password Reset, Email Verification
- `/api/gigs/**` - CRUD operations and application management for tasks
- `/api/rides/**` - Carpool listing and booking system
- `/api/marketplace/**` - Buying and selling physical items
- `/api/flatmates/**` - Flatmate searches and inquiries
- `/api/lost-found/**` - Lost/Found reporting
- `/api/chat/**` - Message history retrieval (WebSocket at `/ws` for live messaging)
- `/api/notifications/**` - SSE endpoints for live push notifications

---

## 🎨 Design System

RuinMIT uses a custom dark-mode-first Tailwind configuration designed to be vibrant, modern, and engaging for students.

**Core Tokens:**
- `ruin-background`: `#0E0E0E` (Deep Black)
- `ruin-card`: `#1A1A1A` (Elevated Surface)
- `ruin-orange`: `#F26522` (Primary Brand)
- `ruin-yellow`: `#FFE11A` (Accent 1)
- `ruin-magenta`: `#FF2D6F` (Accent 2)

---

## 📝 License

This project is open-source and intended for the MIT-WPU student community.

---

<p align="center">
  Built by students, for students.
</p>

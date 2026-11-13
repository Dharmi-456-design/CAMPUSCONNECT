# CampusOne — Student Life Super App 🎓

> **College Submission & Live Demonstration Production Mobile Application**  
> Built with React Native (Expo), TypeScript, Node.js, Express, MongoDB Atlas, and EAS Build.

---

## 🎨 Design System — White Theme (Emerald Green)

As defined in the project design specifications and mobile UI mockups:

| Token | Hex Value | Role / Usage |
|---|---|---|
| **Primary** | `#16A36A` | Emerald Green — Primary buttons, active tabs, brand accents |
| **Background** | `#F8FAFC` | Light grey / slate background |
| **Surface / Card** | `#FFFFFF` | Pure white cards with subtle borders |
| **Primary Text** | `#172B4D` | Deep navy heading & high-contrast typography |
| **Secondary Text** | `#64748B` | Slate grey subtitles & metadata |
| **Border** | `#E2E8F0` | Subtle card & input borders |
| **Error** | `#DC2626` | Form validation & critical alert status |

- **Card Border Radius**: `14–18px` rounded corners.
- **Buttons**: Rounded, Emerald Green `#16A36A` primary buttons.
- **Bottom Navigation**: Home, Academics, Events, Community, Profile.

---

## 🏗️ Monorepo Architecture

```text
CampusOne/
├── frontend/                  # Expo React Native App (TypeScript)
│   ├── app/                   # Expo Router file-based routes
│   │   ├── (auth)/            # Splash, Onboarding, Login, Signup
│   │   ├── (tabs)/            # Home, Academics, Events, Community, Profile
│   │   ├── _layout.tsx        # Root Stack & Theme Provider
│   │   └── index.tsx          # Initial route redirector
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── constants/         # theme.js, colors.js (#16A36A), api.js
│   │   ├── context/           # Theme & App state contexts
│   │   ├── hooks/             # Custom push notification & utility hooks
│   │   └── store/             # Zustand state management
│   ├── eas.json               # EAS Build config (APK preview profile)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── config/            # MongoDB Atlas connection & environment
│   │   ├── controllers/       # Modular API controllers
│   │   ├── middleware/        # JWT auth, error handlers, upload
│   │   ├── models/            # Mongoose schemas:
│   │   │                      # User, Subject, Note, Event, EventRegistration,
│   │   │                      # Notice, LostFoundItem, CommunityPost, Comment
│   │   ├── routes/            # Express RESTful endpoints
│   │   ├── sockets/           # Real-time Socket.IO handlers
│   │   └── server.js          # HTTP & WebSockets bootstrap
│   ├── package.json
│   └── .env.example
└── README.md                  # Installation, Architecture & Submission Guide
```

---

## 📱 Modules & Features

1. **Authentication**: Student registration, login, JWT token auth, secure password hashing, protected routes.
2. **Dashboard**: Personalized student welcome card (Credits, GPA 3.67, Semester), quick actions grid, recent notices, today's timetable.
3. **Academics**: Subjects CRUD, lecture notes repository, semester grade tracking.
4. **Events & Notices**: Campus events discovery, one-click registration, capacity tracking, official administrative notices.
5. **Lost & Found**: Item reporting (Lost/Found), status management, location filters.
6. **Community**: Discussions forum, questions & answers, hackathon squad recruitment, comments.
7. **Profile & Settings**: Account settings, GitHub repository link, app version, and **Android APK Download**.
8. **Admin Panel**: Role-based access control to manage college events, notices, and moderation.

---

## 📦 APK Generation via Expo EAS Build

This project is configured with `eas.json` for Android APK generation:

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Build standalone Android APK
cd frontend
eas build -p android --profile preview
```

The APK download URL is configured in `frontend/src/constants/api.js` via `EXPO_PUBLIC_APK_DOWNLOAD_URL`.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js >= 18
- npm >= 9
- Expo Go or Android Emulator / Device

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Start the Expo development server
npm start
```

---

## 🏷️ Day 0 Git Commit History

1. `chore: initialize CampusOne monorepo structure`
2. `feat: setup Expo React Native TypeScript frontend`
3. `feat: configure Express backend architecture`
4. `feat: configure MongoDB connection and health endpoint`
5. `feat: add shared UI theme and API configuration`
6. `docs: add environment examples and project setup guide`

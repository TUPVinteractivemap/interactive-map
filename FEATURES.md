# TUPV Interactive Map — Application Pages, Functionality & Technical Stack

This documentation describes all main pages, their purpose, how they function, and also details the languages and technology stack used in the web app.

---

## 1. Main Map Page (`/map`)

### Purpose
Provides an interactive 2D map of the TUPV Visayas campus for users to search rooms/buildings and get directions.

### Features
- **Sidebar Navigation:** Tabs for Find Room, Find Building, and Get Route. History link for signed-in users.
- **Room & Building Search:** Live search with contextual tips, debounced search, and result display with metadata.
- **Route Planning:** Select origin/destination buildings for campus navigation (signed-in users only).
- **User Profile:** Shows session status, with secure logout/sign-in workflows.
- **Details Panel:** Shows images, descriptions, tags for selected places.
- **Map Controls:** Zoom, pan, label toggle, floor filter, and responsive controls for desktop/mobile.
- **Selection Logging:** User actions are tracked for personal history.

### How It Works
- Data is loaded from Firestore, managed by React state and context.
- Real-time UI updates for search, selection, and route calculation.
- Authentication via Firebase (Google login).
- Logged-in users have access to personalized features.

---

## 2. User History Page (`/history`)

### Purpose
Shows authenticated users a searchable log of previous searches and route actions.

### Features
- **Recent Searches:** List of rooms/buildings previously searched.
- **Navigation History:** Routes planned in the past.
- **Quick Access:** Revisit previous rooms/buildings/routes.
- **Access Control:** Only available to signed-in users.

### How It Works
- History data fetched from Firestore per user.
- UI allows quick navigation and repeat actions.

---

## 3. Authentication Pages (`/`, `/login`)

### Purpose
Handles sign-in/sign-out for regular users and admins.

### Features
- **Google Authentication:** Secure sign-in.
- **Session Management:** Feedback and redirects after login/logout.
- **Role Handling:** Admins and users routed to correct pages.

### How It Works
- Uses Firebase Auth (Google Provider).
- Sessions managed via React context.

---

## 4. Admin Dashboard (`/admin/dashboard`)

### Purpose
Central hub for administrators to manage users and campus data.

### Features
- **Stats Overview:** Total users, buildings, and other assets.
- **Navigation:** Links to User Management and Map Editor.
- **Branding:** TUPV logo and dashboard title.
- **Logout:** Secure admin session management.

### How It Works
- Real-time stats from Firestore.
- Navigation via React Router.

---

## 5. Admin User Management (`/admin/users`)

### Purpose
Enable admins to manage and audit users.

### Features
- **Search & Filter:** By name, email, student ID.
- **User Cards:** Details including role, join date, last login.
- **Delete Users:** Confirm deletion via dialog.
- **Navigation:** Back to dashboard, logout.

### How It Works
- Firestore for live user data.
- Actions limited to authenticated admins.

---

## 6. Admin Map Editor (`/admin/map-editor`)

### Purpose
Admins manage buildings and rooms on campus.

### Features
- **Building Form:** Add/edit/delete buildings, with coordinates and images.
- **Room Form:** Add/edit/delete rooms, assign to buildings/floors.
- **Room List:** Manage rooms per building.
- **Live Updates:** Data syncs instantly via Firestore.

### How It Works
- All changes update Firestore.
- UI reflects latest campus structure.

---

## 7. Application Layout & Providers

### Purpose
Manages global styles, metadata, and React contexts.

### Features
- **Metadata:** SEO, OpenGraph, Twitter cards, web manifest.
- **Providers:** React Context for authentication, inactivity, and history.
- **Toaster:** Notifications for actions.

### How It Works
- Layout wraps all pages, ensuring context and consistent UI.

---

## 8. Security & Access Control

- **Guest Access:** Most map features open to all; route/history require sign-in.
- **Authenticated Features:** Route planning/history for signed-in users.
- **Admin Features:** Only accessible to authenticated administrators.

---

## 9. Technical Stack & Languages

### Programming Languages
- **TypeScript:** Main language for all React components and business logic.
- **JavaScript:** Used where TypeScript is not strictly required.
- **CSS:** Custom styling via global CSS and utility classes (Tailwind CSS may be in use).
- **JSON:** Configuration, metadata, and Firestore data structure.

### Libraries & Frameworks
- **React:** Main UI framework (with Hooks, Context API).
- **Next.js:** App routing, SSR/SSG support, edge runtime.
- **Firebase:** Authentication, Firestore database, real-time updates.
- **Sonner:** For toast notifications.
- **Other UI Libraries:** Lucide React (icons), custom UI components for forms, dialogs, cards, and carousel.

### Cloud & Infrastructure
- **Vercel:** Likely hosting and deployment (Next.js optimized).
- **Firebase Firestore:** Real-time database for all app data.

### Coding Areas & Concepts
- **Modular Components:** UI broken down into reusable React components (forms, cards, image carousel, dialogs).
- **Context Providers:** Auth, History, Inactivity contexts for state management.
- **Debounced Search:** Optimized live search in room/building queries.
- **Responsive Design:** Layouts adapt to screen size (mobile/desktop).
- **Accessibility:** Keyboard shortcuts, ARIA roles in UI.
- **SEO & Metadata:** Configured for discoverability and social sharing.

---

# Summary

The TUPV Interactive Map web app is built with modern TypeScript/React/Next.js, leveraging Firebase for authentication and data. Each page is designed for clarity and usability, with strong separation of user/admin features. The technical stack enables real-time, secure, and scalable campus navigation and management for all users.

For deeper technical details, see the repository's source code, especially the `/app`, `/lib`, and `/components` directories.
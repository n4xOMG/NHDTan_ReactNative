# AuthApp - Book Management & Reading Platform

This is a React Native (Expo) application designed for managing, reading, and interacting with books and user-generated content. It includes features for both regular users and administrators.

## Features

- **User Authentication:** Secure login, registration, and password management.
- **Book Management:** Browse, view details, read books and chapters.
- **User Content Creation:** Users can create and manage their own books and chapters.
- **Collaborative Editing:** Real-time collaborative editor for chapter content.
- **Social Interaction:** Commenting system for books, chapters, and posts; user posts.
- **User Profiles:** View user profiles, edit own profile, track reading history.
- **Reporting System:** Users can report books, chapters, or comments.
- **Credit System:** Purchase and manage credit packages (likely for accessing premium content).
- **Admin Dashboard:** Management interfaces for users, books, reports, credit packages, and system logs.
- **Notifications:** In-app notification system.
- **Search & Filtering:** Search functionality across various modules.

## Tech Stack

- **Frontend:** React Native with Expo
- **Navigation:** React Navigation
- **State Management:** Redux Toolkit
- **API Communication:** Axios
- **UI Components:** React Native core components, Vector Icons
- **Web Integration:** React Native WebView (used for the collaborative editor)

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-folder>/AuthApp
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    - Create a `.env` file in the `AuthApp` directory (`AuthApp/.env`).
    - Add the necessary environment variables. At minimum, you will need the API base URL:
      ```env
      EXPO_PUBLIC_API_BASE_URL=http://your-backend-api-url.com
      ```
    - _(Add any other required environment variables here, e.g., for image upload services if applicable)_

## Running the Application

1.  **Start the Expo development server:**

    ```bash
    expo start
    ```

2.  **Open the app:**
    - Scan the QR code with the Expo Go app on your physical device (iOS or Android).
    - Or, run on a simulator/emulator by pressing `i` (iOS) or `a` (Android) in the terminal where Expo is running.

## Project Structure (Simplified)

```
AuthApp/
├── src/
│   ├── api/          # Axios instance and API configuration
│   ├── assets/       # Static assets like images, fonts
│   ├── components/   # Reusable UI components
│   ├── navigation/   # React Navigation setup (navigators, stacks)
│   ├── redux/        # Redux store, slices, and persistence setup
│   ├── screens/      # Application screens (grouped by feature/role)
│   ├── services/     # Functions for interacting with the backend API
│   ├── style/        # Stylesheets and theme configuration
│   └── utils/        # Utility functions and helpers
├── App.js            # Root component, Redux Provider setup
├── app.json          # Expo configuration file
├── package.json      # Project dependencies and scripts
└── .env              # Environment variables (needs to be created)
```

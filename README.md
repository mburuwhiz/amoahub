# Amora Hub

Amora Hub is a modern and intuitive dating web application designed to help people find meaningful connections in a safe and secure environment. It features intelligent matchmaking, real-time chat, and a focus on user privacy and safety.

## Features

-   **User Authentication**: Secure local (email/password) and Google OAuth 2.0 authentication.
-   **Onboarding Flow**: A multi-step process for new users to set up their profiles.
-   **User Profiles**: Customizable user profiles with photos, interests, and bio.
-   **Discover Page**: Browse and discover potential matches based on preferences.
-   **Real-time Chat**: Instant messaging with matches powered by Socket.IO.
-   **Photo Uploads**: Users can upload and manage their profile pictures using Cloudinary.
-   **Admin Panel**: A dedicated dashboard for administrators to manage the platform.
-   **Responsive Design**: A mobile-first design that works beautifully on all devices.
-   **Email Notifications**: Modern HTML email templates for account verification and password resets.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Templating Engine**: EJS (Embedded JavaScript)
-   **Authentication**: Passport.js (Local, Google OAuth 2.0)
-   **Real-time Communication**: Socket.IO
-   **Image Storage**: Cloudinary, Multer
-   **Frontend**: HTML5, CSS3, JavaScript

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js](https://nodejs.org/) (v14 or later)
-   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
-   [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hubamora.git
    cd hubamora
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using Yarn:
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in your own values for the variables. See the **Environment Variables** section below for more details on each variable.

4.  **Start the application:**
    ```bash
    npm start
    ```
    The application will be running at `http://localhost:3000`.

## Environment Variables

Below is a description of the variables you will find in the `.env.example` file. You will need to provide your own values for these in your local `.env` file.

-   `PORT`: The port on which the application server will run. Defaults to `3000`.
-   `DOMAIN`: The base URL of your application. This is crucial for generating correct links in emails.
    -   For local development, this should be `http://localhost:3000`.
    -   For production, this should be your public domain (e.g., `https://amorahub.co.ke`).
-   `MONGO_URI`: Your MongoDB connection string.
-   `SESSION_SECRET`: A long, random string used to sign the session ID cookie.
-   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Your credentials for Google OAuth 2.0. See the setup instructions below.
-   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your credentials for the Cloudinary service, used for image hosting. The Cloudinary library will automatically use these three keys to configure itself. **Note:** You do not need to set the `CLOUDINARY_URL` variable; doing so can lead to errors if it is misconfigured.
-   `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USERNAME`, `EMAIL_PASSWORD`: The SMTP connection details for your email sending service (e.g., SendGrid, Mailtrap).
-   `EMAIL_FROM`: The "from" address that will appear on emails sent by the application (e.g., `"Amora Hub" <noreply@yourdomain.com>`).

---

## Configuring Email with Gmail (App Password)

To send emails using a personal Gmail account (`@gmail.com`), you **must** use a Google App Password. For security reasons, Google no longer supports direct sign-in from applications using only your main account password. This is the most common cause of email connection timeout errors.

### Step 1: Enable 2-Step Verification

You must have 2-Step Verification enabled on your Google account before you can create an App Password.
1.  Go to your Google Account settings: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2.  Under "How you sign in to Google," click on **"2-Step Verification"** and follow the on-screen steps to enable it if you haven't already.

### Step 2: Generate an App Password

1.  Go to the **App Passwords** page: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2.  Under "Select the app and device you want to generate the app password for":
    *   For **"Select app,"** choose **"Mail."**
    *   For **"Select device,"** choose **"Other (Custom name)."**
3.  Give it a descriptive name, like `Amora Hub Mailer`, and click **"Generate."**
4.  Google will display a **16-character password** in a yellow box. Copy this password immediately (without the spaces).
5.  Paste this 16-character password into the `EMAIL_PASSWORD` variable in your `.env` file.

**Important:** The `EMAIL_USERNAME` should be your full Gmail address (e.g., `hub.amora@gmail.com`), and the `EMAIL_PASSWORD` must be the 16-character App Password you just generated, **not** your main Google account password.

---

## Production Deployment

When deploying this application to a production environment like Render, Heroku, or behind any reverse proxy, there are a few important considerations:

### Trusting the Proxy

The application includes the setting `app.set('trust proxy', 1);` in `index.js`. This is **crucial** for services that use a reverse proxy. It allows Express to correctly interpret the `X-Forwarded-Proto` header (and others), which is necessary for generating `https://` links for features like Google OAuth and email verification. Without this, the application might generate `http://` links, causing errors like `redirect_uri_mismatch`.

### Environment Variables

Ensure that all the environment variables listed in `.env.example` are correctly set in your deployment environment's settings panel. Specifically, make sure your `DOMAIN` variable points to your public `https://` URL.

---

## Google API Setup Instructions

To enable Google Sign-In, you need to create a project in the Google Cloud Platform Console and get OAuth 2.0 credentials.

1.  **Go to the Google Cloud Platform Console:**
    -   Visit [https://console.cloud.google.com/](https://console.cloud.google.com/).

2.  **Create a new project:**
    -   Click the project dropdown in the top bar and select **"New Project"**.
    -   Give your project a name (e.g., "Amora Hub Auth") and click **"Create"**.

3.  **Enable the Google People API:**
    -   Once your project is created, navigate to **"APIs & Services" > "Library"** from the left-hand menu.
    -   Search for **"Google People API"** and select it.
    -   Click the **"Enable"** button. This API is necessary to get profile information like display name and email.

4.  **Configure the OAuth consent screen:**
    -   Go to **"APIs & Services" > "OAuth consent screen"**.
    -   Choose **"External"** for the User Type and click **"Create"**.
    -   **App information:**
        -   **App name:** Amora Hub (or your app's name)
        -   **User support email:** Your email address
        -   **App logo:** (Optional)
    -   **Developer contact information:** Enter your email address.
    -   Click **"Save and Continue"**.
    -   **Scopes:** You don't need to add any scopes here as they are specified in the application code (`profile`, `email`). Click **"Save and Continue"**.
    -   **Test users:** While your app is in testing mode, you must add the Google accounts you'll use to log in. Click **"Add Users"** and enter your test email addresses.
    -   Click **"Save and Continue"** and then **"Back to Dashboard"**.

5.  **Create OAuth 2.0 credentials:**
    -   Go to **"APIs & Services" > "Credentials"**.
    -   Click **"+ Create Credentials"** and select **"OAuth client ID"**.
    -   **Application type:** Select **"Web application"**.
    -   **Name:** Give it a name, like "Amora Hub Web Client".
    -   **Authorized JavaScript origins:**
        -   For local development, add `http://localhost:3000`.
    -   **Authorized redirect URIs:**
        -   This is the most important step. The URI must match the callback URL in your application's code.
        -   Add `http://localhost:3000/auth/google/callback`.
    -   Click **"Create"**.

6.  **Get your Client ID and Client Secret:**
    -   A dialog will appear with your **Client ID** and **Client Secret**.
    -   Copy these values and paste them into your `.env` file.
    ```env
    GOOGLE_CLIENT_ID=paste_your_client_id_here
    GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
    ```

7.  **Publish your app (for production):**
    -   Once you are ready to go live, you'll need to publish your app from the OAuth consent screen page to allow any Google user to sign in.
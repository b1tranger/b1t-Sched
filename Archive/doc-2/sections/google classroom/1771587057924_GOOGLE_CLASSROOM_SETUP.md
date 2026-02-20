> Original Source: plan/g-class-api/GOOGLE_CLASSROOM_SETUP.md

# Google Classroom API Configuration Guide

To enable Google Classroom features in b1t-Sched, you need to configure a project in the Google Cloud Console and obtain OAuth 2.0 credentials.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top bar and select **New Project**.
3. Name it `b1t-Sched-Classroom` (or similar) and click **Create**.
4. Select the newly created project.

## 2. Enable Google Classroom API
1. In the sidebar, go to **APIs & Services > Library**.
2. Search for **Google Classroom API**.
3. Click on the result and then click **Enable**.

## 3. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (since users are students with likely personal Gmail accounts) and click **Create**.
3. **App Information**:
   - App name: `b1t-Sched`
   - User support email: Select your email.
   - Developer contact information: Enter your email.
4. Click **Save and Continue**.
5. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Search for and select the following scopes:
     - `.../auth/classroom.courses.readonly`
     - `.../auth/classroom.coursework.me.readonly`
     - `.../auth/classroom.announcements.readonly`
     - `.../auth/classroom.rosters.readonly` (Optional, if verifying enrollment)
   - Click **Update** and then **Save and Continue**.
6. **Test Users**:
   - Add your own email address and any other text accounts.
   - Click **Save and Continue**.

## 4. Create OAuth Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials** -> **OAuth client ID**.
3. **Application type**: Web application.
4. **Name**: `b1t-Sched Web Client`.
5. **Authorized JavaScript origins**:
   - Add the URLs where your app is hosted.
   - For local development: `http://127.0.0.1:5500` or `http://localhost:5500` (check your live server port).
   - For production: `https://b1tsched.netlify.app`
   - *Note: Do not add a trailing slash.*
6. Click **Create**.

## 5. Result
You will see a modal with your **Client ID** and **Client Secret**.
- **Copy the Client ID**. You will need to provide this for the application configuration.
- (The Client Secret is not needed for the implicit/token flow used in client-side JS, but keep it safe).

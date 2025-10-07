# Amora Hub - Version 1.10 Changelog

**Release Date:** October 7, 2025

This major update brings a comprehensive overhaul to the Amora Hub application, introducing a modern UI, new features, and significant backend improvements.

---

## ✨ New Features & Major Enhancements

### 1. Complete UI/UX Redesign
- **Desktop Layout:** A new, modern desktop layout has been implemented, featuring a clean header navigation bar for a more spacious and intuitive user experience.
- **Mobile Layout:** The mobile experience has been completely redesigned with a new bottom navigation bar for easy access to all major sections. The mobile layout is now fixed and does not allow pinch-to-zoom, providing a more app-like feel.

### 2. Discover & Matches Page Overhaul
- **Discover Page:** The Discover page has been rebuilt to feature two new sections:
    - **Recently Viewed:** A horizontal scroller showing the last 15 user profiles you have visited.
    - **All People:** A vertical grid showing all potential matches based on your saved preferences.
- **Like/Dislike Functionality:** Users can now "Like" and "Dislike" profiles directly from the Discover page, with a real-time "It's a Match!" notification.

### 3. Chat System Rebuilt
- **New Interface:** The chat page has been completely rebuilt with a new, modern interface.
- **Desktop Layout:** Features a 1/3 (conversation list) and 2/3 (chatroom) split for efficient messaging.
- **Mobile Experience:** The mobile chat is now a full-screen experience. The conversation list (`/chats`) is the default view, and tapping a conversation opens the full-screen chatroom. A back arrow is provided for navigation, and a "Home" button has been added to return to the Discover page.
- **Mobile Keyboard Fix:** The message input box now correctly moves above the keyboard when typing on mobile devices.
- **Admin Chat Restriction:** Users can no longer reply to conversations initiated by an admin (e.g., broadcasts).

### 4. User Account & Profile Enhancements
- **Account Deletion:** Users now have full control over their data and can permanently delete their accounts. This action removes all user data, including photos and messages, and sends a confirmation email.
- **Profile Page Redesign:** Both the personal (`/profile`) and public (`/users/:id`) profile pages have been redesigned to match the new, modern UI.
- **Profile Actions:** The public profile page now includes fully functional "Like," "Dislike," "Report," and "Block" buttons.
- **Click-to-View Gallery:** All gallery photos on profile pages can now be clicked to be viewed in a full-screen modal.

### 5. Onboarding & Registration Improvements
- **Photo Requirement:** The onboarding process now requires all new users to upload a profile picture and at least two gallery photos.
- **Terms & Privacy:** New, detailed static pages for the Terms of Service and Privacy Policy have been added.
- **Signup Agreement:** All new users must now accept the Terms of Service and Privacy Policy via a mandatory checkbox during registration.

### 6. New Email Notifications & Microservice Integration
- **Email Microservice:** The application now uses an external microservice for all email sending, improving reliability.
- **New Notifications:** Users will now receive emails for the following events:
    - When their account is verified by an admin.
    - When their account is banned or unbanned.
    - When they successfully delete their account.
    - When an admin sends a broadcast message.

### 7. Admin & Security Enhancements
- **Banned User Workflow:** Banned users are now blocked from accessing the site and are redirected to a page where they can request a review from an admin.
- **Admin Verification:** The logic for user verification has been corrected. The "verified" badge is now only granted by an admin and is separate from email verification.

---

## 🐛 Bug Fixes
- Fixed numerous layout and styling bugs across the application.
- Corrected all broken profile image and verified badge references.
- Resolved all `CastError` and `TypeError` crashes related to data handling.
- Fixed logical errors in the "Recently Viewed" and "All People" sections.
- Corrected the chat message alignment bug that occurred on page reload.
- Fixed all mobile navigation issues, including the display of the bottom navigation bar on the correct pages.
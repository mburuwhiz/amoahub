# Proposed Updates for Version 1.0.1

Here is a list of proposed features, bug fixes, and improvements for the next version, focusing on enhancing both the appearance and functionality of the Amora Hub platform.

---

## **Bug Fixes**

### 1. **Fix EJS Layout Errors in Static Pages**
-   **Issue:** The `privacy.ejs` and `terms.ejs` pages are crashing due to a `TypeError: layout is not a function`. This is caused by the use of a deprecated `<% layout('layouts/main') -%>` directive.
-   **Goal:** Ensure the static pages render correctly without errors.
-   **Proposed Fix:**
    -   Remove the `<% layout(...) %>` line from all `.ejs` files.
    -   The layout is already handled globally by the `express-ejs-layouts` middleware, so this directive is redundant and causes conflicts.

---

## **Appearance & User Experience (UX)**

### 1. **UI Refresh & Modernization**
-   **Goal:** Update the visual style to be more modern, clean, and engaging.
-   **Details:**
    -   Introduce a new, warmer color palette.
    -   Update typography for better readability across devices.
    -   Redesign key components like buttons, forms, and cards to have a more polished and consistent look.
    -   Add subtle hover effects and transitions to improve user interaction.

### 2. **Enhanced Mobile Responsiveness**
-   **Goal:** Ensure a seamless and intuitive experience on all mobile devices.
-   **Details:**
    -   Optimize the layout for smaller screens, particularly the navigation and chat interfaces.
    -   Improve touch target sizes for easier interaction.

### 3. **Implement Toast Notifications**
-   **Goal:** Provide less intrusive feedback for user actions (e.g., profile updated, message sent).
-   **Details:**
    -   Replace standard browser alerts with a library like SweetAlert2 or Toastify for sleek, non-blocking notifications.

---

## **Functionality**

### 1. **Real-Time Notifications**
-   **Goal:** Improve user engagement by providing instant updates.
-   **Details:**
    -   Leverage Socket.IO to push real-time notifications for:
        -   New matches
        -   New chat messages
        -   Profile views
        -   Admin broadcasts

### 2. **Advanced Profile Search & Filtering**
-   **Goal:** Allow users to find more relevant matches based on their preferences.
-   **Details:**
    -   Add advanced filters to the discover page, allowing users to search by:
        -   Location (with a radius slider)
        -   Specific interests
        -   Age range
        -   Onboarding status

### 3. **User Blocking Feature**
-   **Goal:** Give users more control over their privacy and interactions.
-   **Details:**
    -   Implement a feature allowing users to block other users.
    -   Blocked users will not be able to view the blocker's profile or send them messages.
    -   Add a "Blocked Users" list in the user's profile settings.

### 4. **Secure "Forgot Password" Flow**
-   **Goal:** Provide a secure way for users to reset their password if they forget it.
-   **Details:**
    -   Create a "Forgot Password" link on the login page.
    -   Implement a flow where the user enters their email, receives a secure reset link or OTP, and can set a new password.
    -   This will require a new email template and backend logic.
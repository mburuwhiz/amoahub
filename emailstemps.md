# Required Email Templates for Microservice

This file lists the email templates that the Amora Hub application expects the external email microservice to have available.

The `sendEmail` utility calls the microservice with a `template` name and a `data` object. The microservice should use the corresponding template and populate it with the provided data.

## Template List

1.  **`emailVerification`**:
    -   **Purpose:** Sent to new users to verify their email address.
    -   **Data Context:** `name`, `verificationURL`, `otp`

2.  **`passwordReset`**:
    -   **Purpose:** Sent when a user requests to reset their password.
    -   **Data Context:** `name`, `resetURL`, `otp`

3.  **`userVerified`**:
    -   **Purpose:** Sent to a user when an admin verifies their account.
    -   **Data Context:** `name`

4.  **`userBanned`**:
    -   **Purpose:** Sent to a user when an admin bans their account.
    -   **Data Context:** `name`

5.  **`userUnbanned`**:
    -   **Purpose:** Sent to a user when their account is reinstated.
    -   **Data Context:** `name`

6.  **`broadcast`**:
    -   **Purpose:** Sent to all users when an admin sends a broadcast message.
    -   **Data Context:** `name`, `message`

7.  **`accountDeleted`**:
    -   **Purpose:** Sent to a user as a final confirmation after they have deleted their account.
    -   **Data Context:** `name`
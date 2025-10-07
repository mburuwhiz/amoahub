# Email Microservice API Specification

This document provides a clear specification for the JSON payload sent from the Amora Hub application to the external email microservice. The microservice must be configured to accept a POST request at the `/send` endpoint with a body matching this structure.

## API Endpoint

-   **URL:** `[EMAIL_SERVICE_URL]/send`
-   **Method:** `POST`
-   **Headers:**
    -   `Content-Type: application/json`
    -   `x-api-key: [EMAIL_SERVICE_API_KEY]`

## JSON Payload Structure

The body of the POST request will be a JSON object with the following required fields:

```json
{
  "from": "string",
  "to": "string",
  "subject": "string",
  "template": "string",
  "context": "object"
}
```

-   `from`: The sender's email address and name (e.g., `"Amora Hub <hub.amora@gmail.com>"`).
-   `to`: The recipient's email address.
-   `subject`: The subject line of the email.
-   `template`: The name of the EJS template file (without the extension) to be rendered.
-   `context`: An object containing the dynamic data to be injected into the template.

---

## Template-Specific Context Objects

Below are the specific `template` names sent by the application and the structure of the `context` object for each.

### 1. `emailVerification`

-   **Purpose:** Sent to new users to verify their email address.
-   **`context` object structure:**
    ```json
    {
      "name": "string",
      "verificationURL": "string",
      "otp": "string"
    }
    ```

### 2. `passwordReset`

-   **Purpose:** Sent when a user requests to reset their password.
-   **`context` object structure:**
    ```json
    {
      "name": "string",
      "resetURL": "string",
      "otp": "string"
    }
    ```

### 3. `userVerified`

-   **Purpose:** Sent to a user when an admin verifies their account.
-   **`context` object structure:**
    ```json
    {
      "name": "string"
    }
    ```

### 4. `userBanned`

-   **Purpose:** Sent to a user when an admin bans their account.
-   **`context` object structure:**
    ```json
    {
      "name": "string"
    }
    ```

### 5. `userUnbanned`

-   **Purpose:** Sent to a user when their account is reinstated.
-   **`context` object structure:**
    ```json
    {
      "name": "string"
    }
    ```

### 6. `broadcast`

-   **Purpose:** Sent to all users when an admin sends a broadcast message.
-   **`context` object structure:**
    ```json
    {
      "name": "string",
      "message": "string"
    }
    ```

### 7. `accountDeleted`

-   **Purpose:** Sent to a user as a final confirmation after they have deleted their account.
-   **`context` object structure:**
    ```json
    {
      "name": "string"
    }
    ```
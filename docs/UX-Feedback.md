# UX Feedback: Save/Upload Confirmation and Errors

To make it obvious when actions like Save, Approve, or Upload succeed or fail, the frontend now includes a lightweight global notification system and an async button helper.

- Global toasts (success/error/info) via MUI Snackbar are available in:
  - `frontend/src/components/NotificationCenter.jsx`
  - `frontend/src/notifications/store.js`
  - `frontend/src/setupAxiosNotifications.js` (Axios interceptors)

Integration points already added:

- Entry: `frontend/src/main.jsx` imports `./setupAxiosNotifications` (side-effect).
- Interceptors attach to `frontend/src/utils/api.js` axios instance.
- NotificationCenter mounts automatically.

This setup:
- Mounts a `NotificationCenter` portal to the page
- Attaches Axios interceptors that show a success toast for POST/PUT/PATCH/DELETE and an error toast for failures

Use in components (optional, for explicit messages):

```ts
import { notifySuccess, notifyError, notifyInfo } from './notifications/store'

// After saving
notifySuccess('Saved successfully')

// On a manual error
notifyError('Could not save')
```

Buttons with loading state (optional):

- `frontend/src/components/AsyncButton.jsx` wraps MUI Button and shows a spinner while an async handler runs.

```tsx
import AsyncButton from './components/AsyncButton'
import axios from 'axios'

<AsyncButton
  variant="contained"
  onClick={async () => {
    await axios.put('/projects/123', data)
    // Axios interceptors will show a success toast automatically
  }}
>
  Guardar
></AsyncButton>
```

Notes

- Interceptors avoid noisy toasts for auth endpoints; they show generic success for typical save/approve/upload routes and show error details when available.
- You can still show domain-specific messages using `notifySuccess/notifyError` in the exact place you know the outcome (e.g., after an image upload completes).
- No new packages required; uses MUI + Zustand already in the stack.

Wired screens and flows

- Admin → Projects: create, save config, send for review now show loading on buttons and toasts on completion.
- Admin → Project Info/Slides sections: file uploads show progress and success/error toasts.
- Manager → Review Queue: approve/decline actions show loading and toasts.
- Worker → Induction Wizard: image/camera uploads show progress, submit shows loading and toasts.

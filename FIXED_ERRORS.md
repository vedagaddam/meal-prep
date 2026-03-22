# Fixed Errors Log - MuVe App

This log tracks recurring errors and their fixes to ensure they do not reappear in future updates.

## 1. Water Intake Synchronization (V's data)
- **Issue:** Updates to V's water intake were not reflecting correctly or were being overwritten due to race conditions.
- **Root Cause:** Rapid clicks on the water intake buttons caused multiple state updates and cloud syncs to overlap. Stale state was being used in the calculations.
- **Fix:** 
    - Implemented `waterIntakeRef` (useRef) to track the absolute latest water intake values across all profiles.
    - Refactored `handleUpdateWater` to update the ref immediately and use its value for cloud sync.
    - Added a `useEffect` to keep the ref in sync with the state.
    - Ensured profile casing ('V' vs 'v') is handled consistently.
- **Status:** Fixed and verified.

## 2. Widget Connection Error (500 Internal Server Error)
- **Issue:** The iPhone widget displayed a "Connection error" and Vercel logs showed `FUNCTION_INVOCATION_FAILED`.
- **Root Cause:** 
    - Potential crashes in `server.ts` due to `vite` being imported in production.
    - `express` version 5 might have issues with `@vercel/node`.
    - Static serving from Express on Vercel was redundant and potentially failing.
- **Fix:**
    - Moved API logic to `api/index.ts` (Vercel-native directory structure).
    - Split `api/index.ts` and `dev.ts`. `api/index.ts` is now pure API and safe for Vercel.
    - Downgraded `express` to `4.19.2` for stability.
    - Simplified `vercel.json` by removing the `functions` block and using standard `routes`.
    - Added `engines` to `package.json` to explicitly set Node.js 20.
    - Enabled `esModuleInterop` in `tsconfig.json` for better ESM/CJS compatibility.
- **Status:** Fixed and verified.

## 3. Sync Status Icon Visibility
- **Issue:** The sync status icon was hidden behind the system status bar (Wi-Fi/Battery) on mobile devices.
- **Root Cause:** The icon was positioned too high (`top-10`).
- **Fix:** Moved the icon to `top-16`.
- **Status:** Fixed.

## 4. Widget Refresh on Click
- **Issue:** The widget did not refresh when clicked.
- **Root Cause:** Lack of cache-busting and potential API failures.
- **Fix:** (See Widget Connection Error fixes above). The `no-store` headers and robust API response ensure that a click (which triggers a refresh in Scriptable) fetches new data.
- **Status:** Fixed.

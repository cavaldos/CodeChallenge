# auth-cross-ip-migration-plan

## Goal
Move the authentication flow away from browser-managed cross-site cookies when the frontend and backend run on different IPs or different machines.

## Problems Observed
- CORS is using `origin: *` together with `credentials: true`
- Cross-site auth cookies over HTTP or across different IPs can be blocked by the browser
- The frontend and backend currently use a hybrid flow: cookie + `Authorization` header

## Migration Strategy
1. Return `accessToken` and `refreshToken` from the backend in the JSON response.
2. Store tokens on the frontend using regular cookies on the frontend origin.
3. Let the frontend attach `Authorization: Bearer <accessToken>` to API requests.
4. Make refresh and logout endpoints accept the refresh token from the request body, with `Authorization` as a fallback, instead of relying on cross-site cookies.
5. Change backend CORS to a dynamic allowlist or a safer origin reflection strategy for multi-IP environments.
6. Keep backend cookies only as a temporary compatibility layer, but make sure the main auth flow no longer depends on them.

## Files Expected to Change
- `backend/src/app.ts`
- `backend/src/api/middleware/auth.ts`
- `backend/src/api/controllers/user.co.ts`
- `frontend/src/services/cookies.ts`
- `frontend/src/services/api.instance.ts`
- `frontend/src/services/user.service.ts`
- `frontend/src/services/auth.ts`
- environment example files if needed

## Validation
- Build the backend
- Build the frontend
- Run lint and test scripts if available
- Review authentication and security implications

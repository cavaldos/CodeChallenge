## Plan: Align frontend services with backend API

1. Update auth service to match backend responses (access/refresh tokens, no token on register).
2. Normalize recipients service endpoints and response shapes to backend pagination wrapper.
3. Align campaigns service payloads, response types, and identifiers with backend routes.
4. Run lint/test scripts and `opencode` to verify agents load.

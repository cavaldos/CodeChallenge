# auth-cross-ip-migration-plan

## Goal
Chuyển cơ chế auth khỏi phụ thuộc browser-managed cross-site cookie giữa frontend và backend chạy khác IP/khác máy.

## Problems observed
- CORS đang dùng `origin: *` cùng `credentials: true`
- Cookie auth cross-site qua HTTP/khác IP dễ bị browser chặn
- Frontend/backend đang dùng hybrid flow: cookie + Authorization header

## Migration strategy
1. Backend trả `accessToken` và `refreshToken` trong JSON response.
2. Frontend lưu token bằng cookie thường trên chính origin frontend.
3. Frontend tự thêm `Authorization: Bearer <accessToken>` cho API requests.
4. Endpoint refresh/logout nhận refresh token từ body hoặc Authorization fallback, không còn phụ thuộc cookie cross-site.
5. Backend CORS chuyển sang allowlist động hoặc phản chiếu origin an toàn hơn cho môi trường nhiều IP.
6. Giữ cookie backend ở chế độ tương thích tạm thời, nhưng flow chính không còn phụ thuộc chúng.

## Files expected to change
- backend/src/app.ts
- backend/src/api/middleware/auth.ts
- backend/src/api/controllers/user.co.ts
- frontend/src/services/cookies.ts
- frontend/src/services/api.instance.ts
- frontend/src/services/user.service.ts
- frontend/src/services/auth.ts
- env examples if needed

## Validation
- Build backend
- Build frontend
- Run lint/test scripts if available
- Review auth/security implications

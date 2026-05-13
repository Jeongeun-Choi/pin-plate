# Guest Upload Session Design

## Product Intent

Pin Plate must allow logged-out users to write posts and upload photos. Security fixes must not solve guest upload risk by making image upload login-only.

## Design

Use one server-side upload actor model for web and mobile:

- Logged-in requests resolve to `user:<supabaseUserId>`.
- Logged-out requests resolve to `guest:<guestSessionId>`.
- Web receives a server-issued `pin_plate_guest_upload_session` HttpOnly cookie.
- Mobile native upload can later send the same server-issued token in `X-Pin-Plate-Guest-Session`.
- Current WebView mobile builds can use the web cookie path first.

The guest session token is signed by the server, so clients cannot mint arbitrary guest identities. The token contains a random guest id and an HMAC signature. The server accepts only valid signed tokens; otherwise it creates a new guest session.

## Upload Controls

- Keep request-level upload cap at 5 files.
- Keep file-size cap at 10MB through S3 presigned POST conditions.
- Allow only `image/jpeg`, `image/png`, `image/webp`, and `image/gif`.
- Explicitly reject SVG and non-image MIME types.
- Never trust original filenames for S3 object keys; preserve only a safe extension.
- Prefix object keys with `uploads/users/<id>/` or `uploads/guests/<id>/`.
- Rate limit by resolved upload actor, not by unauthenticated public access alone.

## Mobile Notes

For final app deployment, native mobile code should store the server-issued guest session in secure storage and send it as `X-Pin-Plate-Guest-Session` when uploading outside the WebView. The server route must keep supporting that header so the upload policy remains shared across web and mobile.

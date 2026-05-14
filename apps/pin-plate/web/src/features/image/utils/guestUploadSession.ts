import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

export const GUEST_UPLOAD_COOKIE_NAME = 'pin_plate_guest_upload_session';
export const GUEST_UPLOAD_HEADER_NAME = 'x-pin-plate-guest-session';
export const GUEST_UPLOAD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const getSigningSecret = () =>
  process.env.GUEST_UPLOAD_SECRET ?? process.env.S3_SECRET_ACCESS_KEY!;

const signGuestId = (guestId: string) =>
  createHmac('sha256', getSigningSecret()).update(guestId).digest('base64url');

export const createGuestSessionToken = (guestId = randomUUID()) =>
  `${guestId}.${signGuestId(guestId)}`;

export const getVerifiedGuestId = (token: string | null) => {
  if (!token) return null;

  const [guestId, signature] = token.split('.');
  if (!guestId || !signature) return null;

  const expectedSignature = signGuestId(guestId);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) return null;

  return timingSafeEqual(expectedBuffer, actualBuffer) ? guestId : null;
};

const getCookieValue = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

export const getVerifiedGuestIdFromRequest = (request: Request) => {
  const headerToken = request.headers.get(GUEST_UPLOAD_HEADER_NAME);
  const cookieToken = getCookieValue(
    request.headers.get('cookie'),
    GUEST_UPLOAD_COOKIE_NAME,
  );

  return getVerifiedGuestId(headerToken) ?? getVerifiedGuestId(cookieToken);
};

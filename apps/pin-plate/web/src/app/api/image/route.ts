import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createClient } from '@/utils/supabase/server';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES_PER_REQUEST = 5;
const GUEST_UPLOAD_COOKIE_NAME = 'pin_plate_guest_upload_session';
const GUEST_UPLOAD_HEADER_NAME = 'x-pin-plate-guest-session';
const GUEST_UPLOAD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const;

interface UploadFile {
  filename: string;
  type: keyof typeof ALLOWED_IMAGE_TYPES;
}

interface UploadActor {
  type: 'user' | 'guest';
  id: string;
  guestSessionToken?: string;
  shouldSetGuestCookie: boolean;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
};

const getSigningSecret = () =>
  process.env.GUEST_UPLOAD_SECRET ?? process.env.S3_SECRET_ACCESS_KEY!;

const signGuestId = (guestId: string) =>
  createHmac('sha256', getSigningSecret()).update(guestId).digest('base64url');

const createGuestSessionToken = (guestId = randomUUID()) =>
  `${guestId}.${signGuestId(guestId)}`;

const getVerifiedGuestId = (token: string | null) => {
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

const resolveUploadActor = async (
  request: NextRequest,
): Promise<UploadActor> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      type: 'user',
      id: user.id,
      shouldSetGuestCookie: false,
    };
  }

  const headerToken = request.headers.get(GUEST_UPLOAD_HEADER_NAME);
  const cookieToken = getCookieValue(
    request.headers.get('cookie'),
    GUEST_UPLOAD_COOKIE_NAME,
  );
  const verifiedGuestId =
    getVerifiedGuestId(headerToken) ?? getVerifiedGuestId(cookieToken);

  if (verifiedGuestId) {
    return {
      type: 'guest',
      id: verifiedGuestId,
      guestSessionToken: headerToken ?? cookieToken ?? undefined,
      shouldSetGuestCookie: false,
    };
  }

  const guestSessionToken = createGuestSessionToken();
  const guestId = getVerifiedGuestId(guestSessionToken)!;

  return {
    type: 'guest',
    id: guestId,
    guestSessionToken,
    shouldSetGuestCookie: true,
  };
};

const isUploadFile = (file: unknown): file is UploadFile => {
  if (!file || typeof file !== 'object') return false;

  const candidate = file as { filename?: unknown; type?: unknown };

  return (
    typeof candidate.filename === 'string' &&
    typeof candidate.type === 'string' &&
    candidate.type in ALLOWED_IMAGE_TYPES
  );
};

const getUploadKey = (actor: UploadActor, file: UploadFile) => {
  const ownerPath = actor.type === 'user' ? 'users' : 'guests';
  const extension = ALLOWED_IMAGE_TYPES[file.type];

  return `uploads/${ownerPath}/${actor.id}/${randomUUID()}.${extension}`;
};

export async function POST(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_AWS_REGION ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY ||
    !process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
  ) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  const actor = await resolveUploadActor(request);

  if (!checkRateLimit(`${actor.type}:${actor.id}`)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: 'Too many files (max 5)' },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!isUploadFile(file)) {
        return NextResponse.json(
          { error: 'Unsupported image type' },
          { status: 400 },
        );
      }
    }

    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;
    const region = process.env.NEXT_PUBLIC_AWS_REGION!;

    const presignedItems = await Promise.all(
      files.map(async (file: UploadFile) => {
        const key = getUploadKey(actor, file);
        const { url, fields } = await createPresignedPost(client, {
          Bucket: bucket,
          Key: key,
          Conditions: [
            ['content-length-range', 0, MAX_FILE_SIZE],
            ['eq', '$Content-Type', file.type],
          ],
          Fields: { 'Content-Type': file.type },
          Expires: 300,
        });
        const objectUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        return {
          originalName: file.filename,
          fileName: key,
          url,
          fields,
          objectUrl,
        };
      }),
    );

    const response = NextResponse.json({ urls: presignedItems });

    if (actor.shouldSetGuestCookie && actor.guestSessionToken) {
      response.cookies.set(GUEST_UPLOAD_COOKIE_NAME, actor.guestSessionToken, {
        httpOnly: true,
        maxAge: GUEST_UPLOAD_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return response;
  } catch (error: unknown) {
    console.error('S3 Presigned Post Error:', error);
    return NextResponse.json(
      {
        error: 'Error creating urls',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

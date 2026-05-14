import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { createClient } from '@/utils/supabase/server';
import { buildPublicImageUrl } from '@/features/image/utils/imageReference';
import {
  GUEST_UPLOAD_COOKIE_MAX_AGE,
  GUEST_UPLOAD_COOKIE_NAME,
  createGuestSessionToken,
  getVerifiedGuestId,
  getVerifiedGuestIdFromRequest,
} from '@/features/image/utils/guestUploadSession';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES_PER_REQUEST = 5;
const UPLOAD_METADATA_FIELD_NAMES = new Set([
  'url',
  'objectUrl',
  'publicUrl',
  'imageKey',
  'fileName',
  'originalName',
]);

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

  const verifiedGuestId = getVerifiedGuestIdFromRequest(request);

  if (verifiedGuestId) {
    return {
      type: 'guest',
      id: verifiedGuestId,
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

const getPresignedPostFields = (fields: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(fields).filter(
      ([fieldName]) => !UPLOAD_METADATA_FIELD_NAMES.has(fieldName),
    ),
  );

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
        const publicUrl = buildPublicImageUrl(key);
        return {
          originalName: file.filename,
          fileName: key,
          imageKey: key,
          url,
          fields: getPresignedPostFields(fields),
          objectUrl: publicUrl,
          publicUrl,
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

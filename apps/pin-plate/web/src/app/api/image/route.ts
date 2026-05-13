import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

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

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Too many files (max 5)' },
        { status: 400 },
      );
    }

    for (const file of files) {
      if (!file.type?.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Only image files allowed' },
          { status: 400 },
        );
      }
    }

    const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!;
    const region = process.env.NEXT_PUBLIC_AWS_REGION!;

    const presignedItems = await Promise.all(
      files.map(async (file: { filename: string; type: string }) => {
        const key = `${crypto.randomUUID()}_${file.filename}`;
        const { url, fields } = await createPresignedPost(client, {
          Bucket: bucket,
          Key: key,
          Conditions: [
            ['content-length-range', 0, MAX_FILE_SIZE],
            ['starts-with', '$Content-Type', 'image/'],
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

    return NextResponse.json({ urls: presignedItems });
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

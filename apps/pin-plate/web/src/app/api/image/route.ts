import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

interface FileMetadata {
  name: string;
  type: string;
}

export async function POST(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_AWS_REGION ||
    !process.env.S3_ACCESS_KEY_ID ||
    !process.env.S3_SECRET_ACCESS_KEY ||
    !process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
  ) {
    return NextResponse.json(
      { error: '서버 설정 오류 (AWS 설정 확인 필요)' },
      { status: 500 },
    );
  }

  const { files } = (await request.json()) as { files: FileMetadata[] };

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: '업로드할 파일 정보가 없습니다.' },
      { status: 400 },
    );
  }

  const invalidFile = files.find((f) => !ALLOWED_MIME_TYPES.includes(f.type));
  if (invalidFile) {
    return NextResponse.json(
      { error: `허용되지 않는 파일 형식입니다: ${invalidFile.type}` },
      { status: 400 },
    );
  }

  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  const presignedFiles = await Promise.all(
    files.map(async (file) => {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const key = `${Date.now()}_${baseName}.${ext}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: file.type,
      });

      const presignedUrl = await getSignedUrl(client, command, {
        expiresIn: 300,
      });
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return { presignedUrl, publicUrl };
    }),
  );

  return NextResponse.json({ files: presignedFiles });
}

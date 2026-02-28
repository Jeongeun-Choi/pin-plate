// app/api/presigned/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME
  ) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  try {
    // 프론트에서 { files: [{ filename: "a.jpg", type: "image/jpeg" }, ...] } 형태로 보낸다고 가정
    const { files } = await request.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Promise.all을 사용해 여러 개의 URL을 동시에 생성합니다 (속도 향상)
    const presignedUrls = await Promise.all(
      files.map(async (file: { filename: string; type: string }) => {
        const uniqueFileName = `${Date.now()}_${file.filename}`;

        const command = new PutObjectCommand({
          Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
          Key: uniqueFileName,
          ContentType: file.type,
        });

        const url = await getSignedUrl(client, command, { expiresIn: 60 });

        return {
          originalName: file.filename,
          fileName: uniqueFileName, // 실제 저장된 이름
          url, // 업로드용 URL
        };
      }),
    );

    return NextResponse.json({ urls: presignedUrls });
  } catch (error: any) {
    console.error('S3 Presigned URL Error:', error);
    return NextResponse.json(
      {
        error: 'Error creating urls',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

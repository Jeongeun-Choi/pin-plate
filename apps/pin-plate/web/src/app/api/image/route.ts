import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

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

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '업로드할 파일이 없습니다.' },
        { status: 400 },
      );
    }

    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const imageData = await file.arrayBuffer();
        const buffer = Buffer.from(imageData);

        const compressed = await sharp(buffer)
          .resize({
            width: 1280,
            height: 1280,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        const baseName = file.name.replace(/\.[^.]+$/, '');
        const fileName = `${Date.now()}_${baseName}.webp`;

        await client.send(
          new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: compressed,
            ContentType: 'image/webp',
          }),
        );

        return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;
      }),
    );

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: '이미지 업로드 중 서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

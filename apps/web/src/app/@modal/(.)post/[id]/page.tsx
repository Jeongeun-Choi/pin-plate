import { PostDetailModal } from '@/features/post/components/PostDetailModal';
import React from 'react';

export default async function PostInterceptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailModal id={id} />;
}

import { PostDetailModal } from '@/features/post/components/PostDetailModal';

export default async function PostInterceptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailModal id={id} isIntercepted={true} />;
}

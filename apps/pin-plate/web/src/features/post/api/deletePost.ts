export const deletePost = async (id: number): Promise<void> => {
  const response = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('post_delete_failed');
};

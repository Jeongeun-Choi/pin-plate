import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ToastPreviewClient } from './ToastPreviewClient';

export const dynamic = 'force-dynamic';

export default async function ToastPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ToastPreviewClient />;
}

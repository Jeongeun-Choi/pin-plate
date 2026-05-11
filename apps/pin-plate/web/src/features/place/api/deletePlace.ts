import { createClient } from '@/utils/supabase/client';

export const deletePlace = async (placeId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('places').delete().eq('id', placeId);
  if (error) throw error;
};

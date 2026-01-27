import { Map } from '@/features/map/components/Map';
import { HomeFAB } from './components/HomeFAB';

export default function Home() {
  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Map />
      <HomeFAB />
    </main>
  );
}

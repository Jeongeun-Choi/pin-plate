import type { SharedMap } from '../types/sharedMap';
import { SharedMapCanvas } from './SharedMapCanvas';
import { SharedPlaceList } from './SharedPlaceList';
import * as s from './SharedMapView.css';

interface Props {
  sharedMap: SharedMap;
}

export const SharedMapView = ({ sharedMap }: Props) => {
  const description =
    sharedMap.description.trim() ||
    '핀플레이트에서 공유된 추천 장소를 지도와 리스트로 확인해 보세요.';

  return (
    <section className={s.shell} aria-labelledby="shared-map-title">
      <header className={s.header}>
        <h1 id="shared-map-title" className={s.title}>
          {sharedMap.title}
        </h1>
        <p className={s.description}>{description}</p>
        <p className={s.count}>{sharedMap.place_count}개의 추천 장소</p>
      </header>

      <div className={s.content}>
        <section className={s.mapPanel} aria-label="공유 맛집 지도">
          <SharedMapCanvas places={sharedMap.shared_map_places} />
        </section>
        <aside className={s.listPanel} aria-label="공유 장소 목록">
          <SharedPlaceList places={sharedMap.shared_map_places} />
        </aside>
      </div>
    </section>
  );
};

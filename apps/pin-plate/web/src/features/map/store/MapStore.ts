class MapStore {
  private static instance: MapStore;
  private map: naver.maps.Map | null = null;

  static getInstance(): MapStore {
    if (!MapStore.instance) {
      MapStore.instance = new MapStore();
    }
    return MapStore.instance;
  }

  /**
   * 지도 초기화. 이미 초기화된 상태면 기존 인스턴스를 destroy 후 재생성.
   */
  init(
    element: HTMLDivElement,
    options?: {
      center?: { lat: number; lng: number };
      zoom?: number;
    },
  ): naver.maps.Map {
    if (this.map) {
      return this.map;
    }

    const center = options?.center
      ? new window.naver.maps.LatLng(options.center.lat, options.center.lng)
      : new window.naver.maps.LatLng(37.3595704, 127.105399);

    this.map = new window.naver.maps.Map(element, {
      center,
      zoom: options?.zoom ?? 15,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: false,
      mapTypeControl: false,
    });

    return this.map;
  }

  /**
   * 지도 정리. Naver Maps API의 destroy()를 호출하여 내부 리스너/리소스도 해제.
   */
  destroy(): void {
    if (this.map) {
      this.map.destroy();
    }
    this.map = null;
  }

  /**
   * 지도를 특정 좌표로 이동. map이 null이면 no-op.
   */
  moveTo(lat: number, lng: number): void {
    if (!this.map) return;
    this.map.setCenter(new window.naver.maps.LatLng(lat, lng));
  }

  fitBounds(coords: { lat: number; lng: number }[], padding = 60): void {
    if (!this.map || coords.length === 0) return;
    const bounds = new window.naver.maps.LatLngBounds(
      new window.naver.maps.LatLng(90, 180),
      new window.naver.maps.LatLng(-90, -180),
    );
    coords.forEach(({ lat, lng }) => {
      bounds.extend(new window.naver.maps.LatLng(lat, lng));
    });
    this.map.fitBounds(bounds, {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
    });
  }

  getMap(): naver.maps.Map | null {
    return this.map;
  }
}

export const mapStore = MapStore.getInstance();

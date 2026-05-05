import { vars } from '@pin-plate/ui';

export const toDataUrl = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const getMarkerIcon = (color: string = '#FF0000') => {
  return `<svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M17 0C7.61116 0 0 7.61116 0 17C0 26.3888 17 42 17 42C17 42 34 26.3888 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
    <circle cx="17" cy="17" r="6" fill="white"/>
  </svg>`;
};

export const getPinIcon = (
  color: string = '#FF6B00',
  width: number = 16,
  height: number = 80,
  rating?: number,
) => {
  return `<svg width="${width}" height="${height}" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="45" r="38" fill="#FFFFFF" stroke="${color}" stroke-width="2.5" />
    <circle cx="50" cy="45" r="30" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.6" />
    ${rating !== undefined ? `<text x="50" y="48" text-anchor="middle" dominant-baseline="middle" font-size="32" font-weight="700" fill="${color}" font-family="Pretendard, sans-serif">${rating}</text>` : ''}
    <path d="M38 82C38 82 40 88 50 88C60 88 62 82 62 82" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    <path d="M42 89H58" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.8" />
    <line x1="50" y1="89" x2="50" y2="145" stroke="${color}" stroke-width="4" stroke-linecap="round" />
    <circle cx="50" cy="145" r="5" fill="${color}" />
  </svg>`;
};

export const getCurrentLocationIcon = () => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="rgba(66,133,244,0.2)">
      <animate attributeName="r" from="8" to="12" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="12" cy="12" r="7" fill="#4285F4" stroke="#FFFFFF" stroke-width="2.5"/>
  </svg>`;
};

export const getSearchPinIcon = (width: number = 32, height: number = 64) => {
  const color = '#9E9E9E';
  return `<svg width="${width}" height="${height}" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="45" r="38" fill="#FFFFFF" stroke="${color}" stroke-width="2.5" />
    <circle cx="50" cy="45" r="30" stroke="${color}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.6" />
    <circle cx="50" cy="45" r="8" fill="${color}" opacity="0.5" />
    <path d="M38 82C38 82 40 88 50 88C60 88 62 82 62 82" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    <path d="M42 89H58" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.8" />
    <line x1="50" y1="89" x2="50" y2="145" stroke="${color}" stroke-width="4" stroke-linecap="round" />
    <circle cx="50" cy="145" r="5" fill="${color}" />
  </svg>`;
};

export const getPinColor = (rating: number) => {
  switch (true) {
    case rating <= 1:
      return vars.colors.pin[100];
    case rating <= 2:
      return vars.colors.pin[200];
    case rating <= 3:
      return vars.colors.pin[300];
    case rating <= 4:
      return vars.colors.pin[400];
    case rating <= 5:
    default:
      return vars.colors.pin[500];
  }
};

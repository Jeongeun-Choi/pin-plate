export const getMarkerIcon = (color: string = '#FF0000') => {
  return `
    <div style="width: 34px; height: 42px;">
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M17 0C7.61116 0 0 7.61116 0 17C0 26.3888 17 42 17 42C17 42 34 26.3888 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
        <circle cx="17" cy="17" r="6" fill="white"/>
      </svg>
    </div>
  `;
};

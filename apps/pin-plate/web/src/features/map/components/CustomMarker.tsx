export default function CustomMarker({
  width,
  height,
  color,
  rating,
  icon,
}: {
  width: number;
  height: number;
  color: string;
  rating?: number;
  icon?: 'bookmark';
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="45"
        r="38"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
      />
      <circle
        cx="50"
        cy="45"
        r="30"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      {icon === 'bookmark' ? (
        <g transform="translate(34 27) scale(2)">
          <path
            d="M4.33333 2H11.6667C12.403 2 13 2.59695 13 3.33333V14L8 11.3333L3 14V3.33333C3 2.59695 3.59695 2 4.33333 2Z"
            fill={color}
          />
        </g>
      ) : rating !== undefined ? (
        <text
          x="50"
          y="48"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="32"
          fontWeight="700"
          fill={color}
          fontFamily="Pretendard, sans-serif"
        >
          {rating}
        </text>
      ) : null}
      <path
        d="M38 82C38 82 40 88 50 88C60 88 62 82 62 82"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 89H58"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="50"
        y1="89"
        x2="50"
        y2="145"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="145" r="5" fill={color} />
    </svg>
  );
}

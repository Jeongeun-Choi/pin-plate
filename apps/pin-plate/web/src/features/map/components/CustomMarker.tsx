export default function CustomMarker({
  width,
  height,
  color,
  rating,
}: {
  width: number;
  height: number;
  color: string;
  rating?: number;
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
      {rating !== undefined ? (
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
      ) : (
        ''
      )}
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

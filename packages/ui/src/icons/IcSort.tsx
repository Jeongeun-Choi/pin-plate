import { SVGProps } from 'react';

export const IcSort = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14 10.6667L11.3333 13.3333L8.66666 10.6667"
        stroke="currentColor"
        strokeWidth="1.66601"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3333 13.3333V2.66667"
        stroke="currentColor"
        strokeWidth="1.66601"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 5.33334L4.66667 2.66667L7.33333 5.33334"
        stroke="currentColor"
        strokeWidth="1.66601"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66666 2.66667V13.3333"
        stroke="currentColor"
        strokeWidth="1.66601"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

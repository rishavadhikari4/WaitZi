import clsx from 'clsx';

const sizes = { sm: 'w-8 h-8', md: 'w-14 h-14', lg: 'w-24 h-24' };

export default function LogoLoader({ size = 'md', className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={clsx(sizes[size], className)}
      role="img"
      aria-label="Loading"
    >
      <path
        d="M3.2 8 C1.2 12 1.2 20 3.2 24 C4.4 26.6 8.6 24.6 12 21 C13.8 19.1 14.9 17.6 15.3 16.6 C15.5 16.2 15.5 15.8 15.3 15.4 C14.9 14.4 13.8 12.9 12 11 C8.6 7.4 4.4 5.4 3.2 8 Z"
        fill="#2C2C2A"
        className="[transform-box:fill-box] origin-[right_center] animate-[bow-pulse_2.4s_ease-in-out_infinite]"
      />
      <path
        d="M28.8 8 C30.8 12 30.8 20 28.8 24 C27.6 26.6 23.4 24.6 20 21 C18.2 19.1 17.1 17.6 16.7 16.6 C16.5 16.2 16.5 15.8 16.7 15.4 C17.1 14.4 18.2 12.9 20 11 C23.4 7.4 27.6 5.4 28.8 8 Z"
        fill="#2C2C2A"
        className="[transform-box:fill-box] origin-[left_center] animate-[bow-pulse_2.4s_ease-in-out_infinite]"
      />
      <rect
        x="14.1" y="12.5" width="3.8" height="7" rx="1.2"
        fill="#2563EB"
        className="[transform-box:fill-box] origin-center animate-[knot-pulse_2.4s_ease-in-out_infinite]"
      />
    </svg>
  );
}

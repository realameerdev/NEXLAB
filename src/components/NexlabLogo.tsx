import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
}

export const NexlabLogo: React.FC<LogoProps> = ({
  className = 'w-8 h-8',
  glow = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {glow && (
        <div className="absolute inset-0 bg-[#FF3700] rounded-xl blur-xl opacity-50 pointer-events-none scale-110" />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Layer 1 - Leftmost Book Spine/Page */}
        <path
          d="M 18.5 35
             L 53.5 20.8
             C 57.5 19.2, 61.5 21.2, 61.5 25.5
             C 61.5 29.5, 58.5 32.5, 54.8 34
             L 26.5 45.2
             L 26.5 60.5
             L 18.5 64.8
             Z"
          fill="#FF3700"
        />

        {/* Layer 2 - Middle Book Spine/Page */}
        <path
          d="M 30.5 41
             L 65.5 26.8
             C 69.5 25.2, 73.5 27.2, 73.5 31.5
             C 73.5 35.5, 70.5 38.5, 66.8 40
             L 38.5 51.2
             L 38.5 70.5
             L 30.5 74.8
             Z"
          fill="#FF3700"
        />

        {/* Layer 3 - Front Book 'B' with Ribbon Bookmark cutout */}
        <path
          d="M 42.5 47
             L 53.8 42.4
             L 53.8 53.8
             L 58.5 49
             L 63.2 53.8
             L 63.2 37.2
             C 63.2 37.2, 68 36.8, 73 39.5
             C 78.5 42.5, 80.8 46.8, 78.8 51.5
             C 77.2 55.2, 74.2 55.8, 74.2 55.8
             C 74.2 55.8, 81.5 56.5, 83.5 63.2
             C 85.5 69.8, 80.2 76.5, 71.5 77.2
             L 42.5 78.5
             Z"
          fill="#FF3700"
        />
      </svg>
    </div>
  );
};

export default NexlabLogo;

import React from 'react';
import { Book } from '../types';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-20 h-28 text-[9px]',
    md: 'w-36 h-52 text-xs',
    lg: 'w-56 h-80 text-sm',
  };

  const { from, to, accent, pattern } = book.coverGradient;

  return (
    <div
      className={`relative shrink-0 rounded-md overflow-hidden select-none shadow-lg transition-transform duration-300 group-hover:scale-[1.02] ${sizeClasses[size]} ${className}`}
      style={{
        background: `linear-gradient(145deg, ${from}, ${to})`,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0,0,0,0.4)',
      }}
    >
      {/* Spine highlight & shadow */}
      <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-2 w-[1px] bg-black/40 pointer-events-none z-10" />

      {/* Decorative background geometry */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        {pattern === 'circuits' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`circuits-${book.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 0 12 L 12 12 M 12 0 L 12 24 M 18 6 L 18 18 M 6 18 L 18 18" stroke={accent} strokeWidth="0.75" fill="none" opacity="0.6"/>
                <circle cx="12" cy="12" r="1.5" fill={accent} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#circuits-${book.id})`} />
          </svg>
        )}
        {pattern === 'neural' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20%" cy="30%" r="20" stroke={accent} strokeWidth="0.5" fill="none" />
            <circle cx="80%" cy="40%" r="35" stroke={accent} strokeWidth="0.5" fill="none" />
            <circle cx="45%" cy="75%" r="25" stroke={accent} strokeWidth="0.5" fill="none" />
            <line x1="20%" y1="30%" x2="80%" y2="40%" stroke={accent} strokeWidth="0.5" />
            <line x1="80%" y1="40%" x2="45%" y2="75%" stroke={accent} strokeWidth="0.5" />
          </svg>
        )}
        {pattern === 'mesh' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M-20 40 Q 50 120 180 30 T 300 150" fill="none" stroke={accent} strokeWidth="1" opacity="0.8" />
            <path d="M-20 80 Q 80 180 200 70 T 320 200" fill="none" stroke={accent} strokeWidth="0.75" opacity="0.5" />
          </svg>
        )}
        {pattern === 'waves' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 C40,80 80,20 120,50 C160,80 200,20 240,50" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.6"/>
            <path d="M0,70 C40,100 80,40 120,70 C160,100 200,40 240,70" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.4"/>
          </svg>
        )}
        {pattern === 'geometric' && (
          <div className="w-full h-full grid grid-cols-4 gap-2 p-2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-sm"
                style={{ borderColor: i % 2 === 0 ? accent : 'rgba(255,255,255,0.06)' }}
              />
            ))}
          </div>
        )}
        {pattern === 'grid' && (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, ${accent}15 1px, transparent 1px), linear-gradient(to bottom, ${accent}15 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
        )}
      </div>

      {/* Book cover content overlay */}
      <div className="relative h-full flex flex-col justify-between p-3 z-10 text-white">
        <div>
          {/* Subtle top indicator */}
          <div className="flex items-center justify-between tracking-wider uppercase text-[8px] font-mono text-white/50 mb-1">
            <span>NEXLAB</span>
            {book.isLegallyFree && (
              <span className="text-emerald-400 font-medium">OPEN</span>
            )}
          </div>
          <div
            className="font-mono text-[9px] font-medium tracking-tight text-white/70 line-clamp-1"
            style={{ color: accent }}
          >
            {book.category}
          </div>
        </div>

        {/* Title & Author */}
        <div className="my-auto py-1">
          <h4 className="font-semibold leading-tight tracking-tight text-white drop-shadow-sm line-clamp-3">
            {book.title}
          </h4>
          {book.subtitle && size !== 'sm' && (
            <p className="mt-1 text-[10px] text-white/60 leading-snug line-clamp-2 font-normal">
              {book.subtitle}
            </p>
          )}
        </div>

        <div>
          <div className="w-6 h-[1.5px] mb-1.5" style={{ backgroundColor: accent }} />
          <p className="text-[10px] font-medium text-white/80 line-clamp-1">
            {book.author}
          </p>
          {book.publicationYear && (
            <p className="text-[8px] font-mono text-white/40">
              {book.publicationYear}
            </p>
          )}
        </div>
      </div>

      {/* Surface sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
    </div>
  );
};

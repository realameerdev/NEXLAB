import React from 'react';
import { Bookmark, Star, ArrowUpRight, Check, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';
import { useLibrary } from '../context/LibraryContext';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onQuickRead?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect, onQuickRead }) => {
  const { isBookSaved, toggleSaveBook, state } = useLibrary();
  const saved = isBookSaved(book.id);
  const readingRecord = state.readingStatus[book.id];

  return (
    <div className="group relative flex flex-col justify-between bg-white hover:bg-[#fffbf9] border border-zinc-200/90 hover:border-[#FF3700]/50 rounded-2xl p-4 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(255,55,0,0.08)]">
      {/* Top section: Cover + details */}
      <div className="flex gap-4 items-start">
        {/* Book cover */}
        <div
          onClick={() => onSelect(book)}
          className="cursor-pointer shrink-0"
          title={`View details for ${book.title}`}
        >
          <BookCover book={book} size="md" />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          <div>
            {/* Unboxed Metadata Header (No static pills!) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 font-mono tracking-tight mb-1.5">
              <span className="text-[#FF3700] font-semibold">{book.category}</span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span>{book.skillLevel}</span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span>{book.format}</span>
            </div>

            {/* Title */}
            <h3
              onClick={() => onSelect(book)}
              className="text-base font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors leading-snug cursor-pointer line-clamp-2"
            >
              {book.title}
            </h3>

            {/* Author */}
            <p className="text-xs text-zinc-500 mt-0.5">
              by <span className="text-zinc-800 font-medium">{book.author}</span>
              {book.coAuthors && book.coAuthors.length > 0 && ` +${book.coAuthors.length}`}
            </p>

            {/* Short Description */}
            <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed font-sans">
              {book.shortDescription}
            </p>
          </div>

          {/* Availability & Rating row */}
          <div className="mt-3 pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className={book.isLegallyFree ? 'text-[#FF3700] font-medium' : 'text-zinc-500'}>
                {book.availability}
              </span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span className="text-zinc-500">{book.estimatedReadTime}</span>
            </div>

            <div className="flex items-center gap-1 text-zinc-700">
              <Star className="w-3.5 h-3.5 fill-[#FF3700] text-[#FF3700]" />
              <span className="font-mono text-xs font-semibold">{book.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar if active */}
      {readingRecord && (
        <div className="mt-3 pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
            <span className="capitalize">{readingRecord.status.replace('_', ' ')}</span>
            <span className="font-mono text-[#FF3700] font-semibold">{readingRecord.progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#FF3700] h-full rounded-full transition-all duration-300"
              style={{ width: `${readingRecord.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(book)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-[#FF3700] border border-zinc-200 hover:border-[#FF3700] rounded-xl transition-all cursor-pointer shadow-2xs group/btn tracking-[-0.01em]"
        >
          <span>View Book</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </button>

        {book.isLegallyFree && book.readOnlineUrl && onQuickRead && (
          <button
            onClick={() => onQuickRead(book)}
            title="Read Online Now"
            className="p-2 text-[#FF3700] hover:text-white bg-[#FF3700]/10 hover:bg-[#FF3700] border border-[#FF3700]/25 rounded-xl transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => toggleSaveBook(book.id)}
          aria-label={saved ? 'Remove from saved books' : 'Save to personal library'}
          title={saved ? 'Saved in personal library' : 'Save book'}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            saved
              ? 'bg-[#FF3700] border-[#FF3700] text-white shadow-xs'
              : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-400 hover:text-zinc-700'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBook
}) => {
  const { allBooks } = useLibrary();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? allBooks.filter(b => {
        const q = query.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.topics.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : allBooks.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-zinc-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-zinc-200 bg-white">
          <Search className="w-5 h-5 text-[#FF3700] mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search books, authors, systems, categories, or keywords..."
            className="flex-1 bg-transparent border-none text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-900 mr-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 hover:text-zinc-900 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            {query.trim() ? `Search Results (${filtered.length})` : 'Popular in Catalog'}
          </div>

          {filtered.map(book => (
            <div
              key={book.id}
              onClick={() => {
                onSelectBook(book);
                onClose();
              }}
              className="p-3 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-[#FF3700] transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <BookCover book={book} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF3700] font-bold">
                    <span>{book.category}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500 font-normal">{book.skillLevel}</span>
                    {book.isLegallyFree && (
                      <span className="text-[#FF3700] font-semibold">· Free Open Edition</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 truncate">
                    by {book.author}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 text-[11px] text-zinc-400 group-hover:text-[#FF3700] font-semibold transition-colors">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching books found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Search NEXLAB Catalog</span>
          <span className="text-zinc-600 font-medium">Tip: Ask NEXLAB AI for contextual learning goals</span>
        </div>
      </div>
    </div>
  );
};

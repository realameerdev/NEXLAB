import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, BookOpen, ExternalLink, Download, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { BOOKS_DATA } from '../data/booksData';
import { BookCard } from './BookCard';

interface FreeLibraryViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
}

export const FreeLibraryView: React.FC<FreeLibraryViewProps> = ({
  onSelectBook,
  onOpenReader
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const freeBooks = useMemo(() => {
    return BOOKS_DATA.filter(book => book.isLegallyFree);
  }, []);

  const filteredBooks = useMemo(() => {
    return freeBooks.filter(book => {
      const matchSearch =
        searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchLicense =
        selectedLicenseType === 'all' ||
        book.availability.toLowerCase().includes(selectedLicenseType.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || book.category === selectedCategory;

      return matchSearch && matchLicense && matchCategory;
    });
  }, [freeBooks, searchQuery, selectedLicenseType, selectedCategory]);

  const categoriesAvailable = Array.from(new Set(freeBooks.map(b => b.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* Header with Legal Guarantee */}
      <div className="space-y-4 border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700]">
          <ShieldCheck className="w-4 h-4 text-[#FF3700]" />
          <span>100% Legal & Open-Access Technical Library</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              The Free Library
            </h1>
            <p className="text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
              Seminal computer science texts, interactive shader guides, and foundational mathematics—freely accessible with authorized open licenses.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-[#FF3700]/30 rounded-2xl text-xs text-zinc-800 max-w-sm shadow-sm">
            <span className="font-bold text-[#FF3700] block mb-0.5">Strict Legal Verification</span>
            <span className="text-[11px] text-zinc-600 leading-snug">
              Every book listed is verified public domain, Creative Commons, or authorized by its author and academic publisher.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search free books, authors, or topics (e.g. GLSL, Compilers, Git)..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700] focus:ring-1 focus:ring-[#FF3700]"
          />
        </div>

        {/* License Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono hidden md:inline">License:</span>
          <select
            value={selectedLicenseType}
            onChange={e => setSelectedLicenseType(e.target.value)}
            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-800 text-xs focus:outline-none focus:border-[#FF3700]"
          >
            <option value="all">All Free Licenses ({freeBooks.length})</option>
            <option value="open access">Open Access</option>
            <option value="creative commons">Creative Commons</option>
            <option value="public domain">Public Domain</option>
          </select>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-800 text-xs focus:outline-none focus:border-[#FF3700]"
          >
            <option value="all">All Categories</option>
            {categoriesAvailable.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Showing {filteredBooks.length} legally free books</span>
          <span className="text-[#FF3700] font-semibold">Open Web Edition + PDF Downloads</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              onQuickRead={onOpenReader}
            />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
            <p className="text-sm font-medium text-zinc-700">No free books matched your filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLicenseType('all');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-[#FF3700] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Open Source Culture Manifesto Banner */}
      <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <h4 className="text-zinc-950 font-bold text-sm">
            Why Free & Open-Access Technical Literature Matters
          </h4>
          <p className="text-zinc-600 max-w-2xl leading-relaxed">
            Pioneers like Robert Nystrom, Marijn Haverbeke, Daniel Shiffman, and MIT Press democratize engineering by hosting full, interactive digital editions. NEXLAB indexes, formats, and celebrates verified open knowledge.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-[#FF3700]/30 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#FF3700]" />
          <span className="font-mono text-[#FF3700] font-semibold text-xs">Verified Copyright Compliant</span>
        </div>
      </div>
    </div>
  );
};

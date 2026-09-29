import React, { useState, useMemo } from 'react';
import { Layers, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Book, Category, SkillLevel, BookFormat, LegalAvailability } from '../types';
import { BOOKS_DATA, CATEGORIES_LIST } from '../data/booksData';
import { BookCard } from './BookCard';

interface CategoriesViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
  initialCategory?: Category;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onSelectBook,
  onOpenReader,
  initialCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    initialCategory || 'all'
  );

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

  const filteredBooks = useMemo(() => {
    return BOOKS_DATA.filter(book => {
      const matchCat = selectedCategory === 'all' || book.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSkill =
        skillFilter === 'all' || book.skillLevel === skillFilter || book.skillLevel === 'All Levels';

      const matchFormat = formatFilter === 'all' || book.format === formatFilter;

      const matchAvail =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'free' && book.isLegallyFree) ||
        (availabilityFilter === 'commercial' && !book.isLegallyFree);

      return matchCat && matchSearch && matchSkill && matchFormat && matchAvail;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.publicationYear - a.publicationYear;
      return a.title.localeCompare(b.title);
    });
  }, [selectedCategory, searchQuery, skillFilter, formatFilter, availabilityFilter, sortBy]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES_LIST.forEach(cat => {
      counts[cat] = BOOKS_DATA.filter(b => b.category === cat).length;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* Header */}
      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#FF3700]">
          <Layers className="w-4 h-4 text-[#FF3700]" />
          <span>Curated Disciplines & Domains</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950">
          Explore by Category
        </h1>
        <p className="text-sm text-zinc-600 font-normal max-w-2xl leading-relaxed">
          Filter through 15 specialized domains spanning distributed computing, neural networks, game engines, UI ergonomics, and startup strategy.
        </p>
      </div>

      {/* Horizontal Category Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer tracking-[-0.01em] ${
            selectedCategory === 'all'
              ? 'bg-[#FF3700] border-[#FF3700] text-white shadow-md shadow-[#FF3700]/20'
              : 'bg-white border-zinc-200 hover:border-[#FF3700]/50 text-zinc-700 hover:text-zinc-950'
          }`}
        >
          All Domains ({BOOKS_DATA.length})
        </button>

        {CATEGORIES_LIST.map(category => {
          const isSelected = selectedCategory === category;
          const count = categoryCounts[category] || 0;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 tracking-[-0.01em] ${
                isSelected
                  ? 'bg-[#FF3700] border-[#FF3700] text-white shadow-md shadow-[#FF3700]/20'
                  : 'bg-white border-zinc-200 hover:border-[#FF3700]/50 text-zinc-700 hover:text-zinc-950'
              }`}
            >
              <span>{category}</span>
              <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Filter ${selectedCategory === 'all' ? 'catalog' : selectedCategory}...`}
            className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700] focus:ring-1 focus:ring-[#FF3700] font-normal"
          />
        </div>

        {/* Dropdown Filters - 2 cols on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Skill Level */}
          <select
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#FF3700]"
          >
            <option value="all">All Skill Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Format */}
          <select
            value={formatFilter}
            onChange={e => setFormatFilter(e.target.value)}
            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#FF3700]"
          >
            <option value="all">All Formats</option>
            <option value="Web Interactive">Web Interactive</option>
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="PDF">PDF</option>
          </select>

          {/* Free/Legal Availability */}
          <select
            value={availabilityFilter}
            onChange={e => setAvailabilityFilter(e.target.value)}
            className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-800 text-xs font-semibold focus:outline-none focus:border-[#FF3700]"
          >
            <option value="all">All Availability</option>
            <option value="free">Free & Legal Open-Access</option>
            <option value="commercial">Commercial Editions</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-zinc-800 text-xs font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="year">Publication Year</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>{filteredBooks.length} books found</span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[#FF3700] font-semibold underline hover:text-[#E53100] cursor-pointer"
            >
              Clear category filter
            </button>
          )}
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
            <p className="text-sm font-medium text-zinc-700">No books match your selected filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('all');
                setFormatFilter('all');
                setAvailabilityFilter('all');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-[#FF3700] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

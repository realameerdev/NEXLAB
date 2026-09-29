import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  BookOpen,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Star,
  Users,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Book, Category } from '../types';
import { BOOKS_DATA, CATEGORIES_LIST } from '../data/booksData';
import { IntelligentSearch } from './IntelligentSearch';
import { BookCard } from './BookCard';
import { BookCover } from './BookCover';
import { ActiveTab } from './Navbar';
import { NexlabLogo } from './NexlabLogo';

interface ExploreViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onFilterCategory?: (category: Category) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectBook,
  onOpenReader,
  setActiveTab,
  onFilterCategory
}) => {
  const [activeCuratedTab, setActiveCuratedTab] = useState<'trending' | 'recent' | 'beginner' | 'deep' | 'free'>('trending');
  const [hoveredDeckIndex, setHoveredDeckIndex] = useState<number | null>(null);

  // Showcase books for the Pallet Ross fanned cards deck
  const deckBookIds = [
    'the-mom-test',
    'game-programming-patterns',
    'designing-data-intensive-applications',
    'crafting-interpreters',
    'refactoring-ui'
  ];
  const deckBooks = deckBookIds
    .map(id => BOOKS_DATA.find(b => b.id === id))
    .filter(Boolean) as Book[];

  // Curated collections
  const curatedCollections = [
    {
      title: 'The Solo Founder Canon',
      tagline: 'Ruthless validation, appetite scoping, and monopoly defensibility.',
      bookIds: ['the-mom-test', 'shape-up', 'zero-to-one', 'show-your-work'],
      badge: 'Startups & Strategy'
    },
    {
      title: 'The Principal Engineer Shelf',
      tagline: 'Distributed data systems, language runtimes, and engineering leadership.',
      bookIds: ['designing-data-intensive-applications', 'crafting-interpreters', 'high-output-management', 'threat-modeling-shostack'],
      badge: 'Systems & Architecture'
    },
    {
      title: 'Next-Gen Shaders & Graphics',
      tagline: 'GLSL fragment shaders, procedural math, and game engine mechanics.',
      bookIds: ['the-book-of-shaders', 'game-programming-patterns', 'nature-of-code'],
      badge: 'Interactive 3D'
    },
    {
      title: 'The Humane Design Stack',
      tagline: 'Affordances, ergonomic usability, and tactical UI spacing for devs.',
      bookIds: ['the-design-of-everyday-things', 'refactoring-ui', 'eloquent-javascript'],
      badge: 'Interface & Craft'
    }
  ];

  // Filtered views for tabs
  const tabBooks = React.useMemo(() => {
    switch (activeCuratedTab) {
      case 'trending':
        return BOOKS_DATA.filter(b => b.isTrending || b.rating >= 4.9).slice(0, 6);
      case 'recent':
        return BOOKS_DATA.filter(b => b.isRecentlyAdded || b.publicationYear >= 2021).slice(0, 6);
      case 'beginner':
        return BOOKS_DATA.filter(b => b.skillLevel === 'Beginner' || b.skillLevel === 'All Levels').slice(0, 6);
      case 'deep':
        return BOOKS_DATA.filter(b => b.skillLevel === 'Advanced' || b.skillLevel === 'Intermediate').slice(0, 6);
      case 'free':
        return BOOKS_DATA.filter(b => b.isLegallyFree).slice(0, 6);
      default:
        return BOOKS_DATA.slice(0, 6);
    }
  }, [activeCuratedTab]);

  return (
    <div className="space-y-20 pb-20 bg-white">
      {/* ========================================================================= */}
      {/* PALLET ROSS HERO SECTION: Editorial Title + Fanned Interactive Deck       */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
        {/* Subtle warm silky radial background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#FF3700]/[0.06] via-[#FF3700]/[0.02] to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          {/* Logo Brand Emblem Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#FF3700]/25 shadow-sm shadow-[#FF3700]/10 hover:border-[#FF3700]/50 transition-all duration-300">
            <NexlabLogo className="w-4 h-4" glow={false} />
            <span className="text-xs font-mono font-medium text-zinc-800">
              <strong className="text-[#FF3700] font-bold">NEXLAB</strong> · Knowledge for What You’re Building
            </span>
          </div>

          {/* Hero Headline (Clean Editorial Style as requested) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08] max-w-4xl mx-auto">
            Find the right books for <br className="hidden sm:inline" />
            <span className="text-[#FF3700]">what you’re building.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Discover books, research smarter, and get personalized recommendations based on your goals, interests, and current projects.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('categories')}
              className="py-3.5 px-8 rounded-full bg-[#FF3700] hover:bg-[#E53100] text-white font-semibold text-sm sm:text-base shadow-xl shadow-[#FF3700]/25 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Library
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className="py-3.5 px-7 rounded-full bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 hover:border-[#FF3700]/40 font-semibold text-sm sm:text-base inline-flex items-center gap-2.5 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-[#FF3700]" />
              <span>Ask NEXLAB AI</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* PALLET ROSS FANNED DECK INTERACTION WITH FLOATING TESTIMONIAL PILLS       */}
          {/* ========================================================================= */}
          <div className="pt-10 pb-4 relative max-w-5xl mx-auto">
            {/* Floating Reader Badge 1 (Left) */}
            <div className="hidden lg:flex items-center gap-3 absolute top-6 left-2 z-30 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-3.5 shadow-xl shadow-zinc-900/5 max-w-xs text-left transition-all hover:scale-105 duration-300">
              <div className="w-10 h-10 rounded-full bg-[#FF3700]/10 border border-[#FF3700]/20 flex items-center justify-center text-[#FF3700] font-bold text-xs shrink-0">
                SC
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-[#FF3700] mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#FF3700]" />
                  ))}
                </div>
                <p className="font-semibold text-zinc-900 text-[11px] leading-tight">
                  “Designing Data-Intensive Applications was the blueprint for our platform.”
                </p>
                <span className="text-[10px] text-zinc-500 font-mono">Sarah C. · Staff Eng</span>
              </div>
            </div>

            {/* Floating Reader Badge 2 (Right) */}
            <div className="hidden lg:flex items-center gap-3 absolute top-12 right-2 z-30 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl p-3.5 shadow-xl shadow-zinc-900/5 max-w-xs text-left transition-all hover:scale-105 duration-300">
              <div className="w-10 h-10 rounded-full bg-[#FF3700]/10 border border-[#FF3700]/20 flex items-center justify-center text-[#FF3700] font-bold text-xs shrink-0">
                MR
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-[#FF3700] mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#FF3700]" />
                  ))}
                </div>
                <p className="font-semibold text-zinc-900 text-[11px] leading-tight">
                  “Found The Mom Test before speaking with 40 B2B buyers. Saved 6 months.”
                </p>
                <span className="text-[10px] text-zinc-500 font-mono">Marcus R. · Founder</span>
              </div>
            </div>

            {/* Floating Center Pill: Community Metric */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-medium mb-6 shadow-sm">
              <Users className="w-3.5 h-3.5 text-[#FF3700]" />
              <span>Over <strong className="text-zinc-950 font-bold">45,000+</strong> builders discovering curated titles</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF3700]" />
              <span className="text-[#FF3700] font-semibold text-[11px]">Verified Legal</span>
            </div>

            {/* The Fanned Deck of 5 Books */}
            <div className="relative h-[340px] sm:h-[400px] flex items-center justify-center">
              {deckBooks.map((book, index) => {
                // Calculate rotation and horizontal offset for fanned arc
                const count = deckBooks.length;
                const offsetFromCenter = index - Math.floor(count / 2); // -2, -1, 0, 1, 2
                const rotation = offsetFromCenter * 7; // -14deg, -7deg, 0, 7deg, 14deg
                const translateX = offsetFromCenter * 65; // px horizontal spread
                const translateY = Math.abs(offsetFromCenter) * 12; // slight downward arch on outer wings
                const isHovered = hoveredDeckIndex === index;

                return (
                  <div
                    key={book.id}
                    onMouseEnter={() => setHoveredDeckIndex(index)}
                    onMouseLeave={() => setHoveredDeckIndex(null)}
                    onClick={() => onSelectBook(book)}
                    style={{
                      transform: isHovered
                        ? `translateX(${translateX}px) translateY(-25px) rotate(0deg) scale(1.08)`
                        : `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(1)`,
                      zIndex: isHovered ? 40 : 10 + Math.abs(offsetFromCenter === 0 ? 5 : 2 - Math.abs(offsetFromCenter)),
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="absolute cursor-pointer group"
                  >
                    <div className="w-[180px] sm:w-[220px] bg-white rounded-2xl p-2.5 sm:p-3 border border-zinc-200/90 shadow-2xl shadow-zinc-950/15 group-hover:border-[#FF3700] group-hover:shadow-[#FF3700]/20 transition-all duration-300">
                      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden shadow-inner">
                        <BookCover book={book} size="md" className="w-full h-full" />
                      </div>
                      <div className="pt-2.5 px-1 text-left">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#FF3700]">
                          {book.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate leading-snug">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-zinc-400 font-mono pt-2">
              Hover over cards to inspect · Click any title for syllabus, reader & preview
            </p>
          </div>

          {/* Large Intelligent Search Interface (Positioned seamlessly beneath hero) */}
          <div className="pt-4 max-w-4xl mx-auto">
            <IntelligentSearch
              onSelectBook={onSelectBook}
              onOpenReader={onOpenReader}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DISCOVER & TRENDING SECTION (Pure White & Red)                            */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700] mb-1">
              <Compass className="w-4 h-4" />
              <span>Catalog Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Discover High-Signal Literature
            </h2>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-2xl border border-zinc-200 overflow-x-auto">
            {(
              [
                { id: 'trending', label: 'Trending Books' },
                { id: 'recent', label: 'Recently Added' },
                { id: 'beginner', label: 'Beginner-Friendly' },
                { id: 'deep', label: 'Deep Technical' },
                { id: 'free', label: 'Legally Free' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCuratedTab(tab.id)}
                className={`py-2 px-3.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeCuratedTab === tab.id
                    ? 'bg-[#FF3700] text-white shadow-md shadow-[#FF3700]/25'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Curated Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tabBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              onQuickRead={onOpenReader}
            />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CURATED THEMATIC COLLECTIONS                                              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700] mb-1">
              <Award className="w-4 h-4" />
              <span>Thematic Shelf Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Curated Collections
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {curatedCollections.map((col, idx) => {
            const books = col.bookIds
              .map(id => BOOKS_DATA.find(b => b.id === id))
              .filter(Boolean) as Book[];

            return (
              <div
                key={idx}
                className="p-6 bg-white border border-zinc-200 hover:border-[#FF3700]/50 rounded-2xl space-y-4 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF3700]">
                      {col.badge}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-950 tracking-tight group-hover:text-[#FF3700] transition-colors">
                      {col.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {col.tagline}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {books.map(b => (
                    <div
                      key={b.id}
                      onClick={() => onSelectBook(b)}
                      className="cursor-pointer group/item space-y-1.5"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden border border-zinc-200 shadow-sm group-hover/item:border-[#FF3700] transition-all">
                        <BookCover book={b} size="sm" className="w-full h-full" />
                      </div>
                      <p className="text-[11px] font-medium text-zinc-800 truncate group-hover/item:text-[#FF3700]">
                        {b.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BROWSE BY DOMAIN / TOPICS                                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF3700] mb-1">
              <Layers className="w-4 h-4" />
              <span>Disciplines</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Popular Topics & Domains
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs font-semibold text-[#FF3700] hover:text-[#E53100] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all 15 categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES_LIST.map(category => {
            const count = BOOKS_DATA.filter(b => b.category === category).length;
            return (
              <button
                key={category}
                onClick={() => {
                  if (onFilterCategory) onFilterCategory(category as Category);
                  setActiveTab('categories');
                }}
                className="p-4 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700] rounded-xl text-left transition-all duration-200 cursor-pointer group flex flex-col justify-between h-24 shadow-sm hover:shadow-md"
              >
                <span className="text-xs font-bold text-zinc-900 group-hover:text-[#FF3700] leading-snug">
                  {category}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-700">
                  {count} {count === 1 ? 'Book' : 'Books'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FREE LEGAL EBOOKS HIGHLIGHT BANNER (Pure White & Red)                     */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 bg-gradient-to-br from-white via-zinc-50 to-[#FF3700]/[0.04] border border-[#FF3700]/30 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl shadow-[#FF3700]/5">
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF3700]">
              <ShieldCheck className="w-4 h-4" />
              <span>The Free & Open Access Library</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Looking for verified free technical books?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-sans">
              Explore our dedicated open-access repository featuring Crafting Interpreters, Structure and Interpretation of Computer Programs, Deep Learning, The Book of Shaders, and Shape Up. All completely free, legal, and author-authorized.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('free')}
            className="py-3.5 px-7 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs sm:text-sm font-semibold shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer shrink-0 inline-flex items-center gap-2 relative z-10 hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Free Library</span>
          </button>
        </div>
      </section>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ArrowRight, X, Loader2, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { BOOKS_DATA } from '../data/booksData';
import { BookCard } from './BookCard';

interface IntelligentSearchProps {
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
}

export const IntelligentSearch: React.FC<IntelligentSearchProps> = ({
  onSelectBook,
  onOpenReader
}) => {
  const [query, setQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiInsight, setAiInsight] = useState<{
    synthesizedInsight: string;
    recommendations: { bookId: string; rationale: string }[];
    relatedTopics: string[];
  } | null>(null);

  const examplePrompts = [
    'I want to learn game development.',
    'Books for becoming a better frontend developer.',
    'I’m building an AI startup.',
    'I want to improve my content strategy.'
  ];

  // Client-side fuzzy filter
  const matchedBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return BOOKS_DATA.filter(book => {
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchCategory = book.category.toLowerCase().includes(q);
      const matchTopics = book.topics.some(t => t.toLowerCase().includes(q));
      const matchDesc = book.shortDescription.toLowerCase().includes(q);
      const matchProject = book.recommendedForProject?.toLowerCase().includes(q);
      const matchCareer = book.targetCareer?.toLowerCase().includes(q);

      return matchTitle || matchAuthor || matchCategory || matchTopics || matchDesc || matchProject || matchCareer;
    });
  }, [query]);

  const handleSynthesize = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSynthesizing(true);
    setAiInsight(null);

    try {
      const res = await fetch('/api/gemini/intelligent-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data);
      }
    } catch (err) {
      console.error('Error querying intelligent search:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSynthesize(query);
    }
  };

  const handleSelectExample = (prompt: string) => {
    setQuery(prompt);
    handleSynthesize(prompt);
  };

  // Find books explicitly recommended by AI synthesis
  const aiRecommendedBooks = useMemo(() => {
    if (!aiInsight?.recommendations) return [];
    return aiInsight.recommendations
      .map(rec => {
        const book = BOOKS_DATA.find(b => b.id === rec.bookId);
        return book ? { book, rationale: rec.rationale } : null;
      })
      .filter(Boolean) as { book: Book; rationale: string }[];
  }, [aiInsight]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Container */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF3700]/20 to-[#FF7043]/15 rounded-2xl blur-md opacity-40 group-hover:opacity-100 transition duration-500" />
        <div className="relative flex items-center bg-white border border-zinc-200/90 rounded-2xl p-2 sm:p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] focus-within:border-[#FF3700] focus-within:ring-2 focus-within:ring-[#FF3700]/20 transition-all">
          <div className="pl-3 pr-2 text-zinc-400">
            <Search className="w-5 h-5 text-[#FF3700]" />
          </div>

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What are you trying to learn or build?"
            className="flex-1 bg-transparent border-none text-sm sm:text-base text-zinc-900 placeholder-zinc-400 focus:outline-none font-sans"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setAiInsight(null);
              }}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleSynthesize(query)}
            disabled={!query.trim() || isSynthesizing}
            className="inline-flex items-center gap-2 py-2.5 px-4 sm:px-5 bg-[#FF3700] hover:bg-[#e03000] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs sm:text-sm tracking-[-0.01em] rounded-xl shadow-md shadow-[#FF3700]/25 transition-all cursor-pointer shrink-0"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-orange-200" />
                <span>Search with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-600 font-semibold tracking-tight">Try:</span>
        {examplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSelectExample(prompt)}
            className="text-zinc-700 hover:text-[#FF3700] py-1 px-3 rounded-full bg-zinc-50 hover:bg-[#FF3700]/5 border border-zinc-200 hover:border-[#FF3700]/40 transition-all cursor-pointer text-left font-semibold text-[11px]"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* AI Synthesized Insight Display */}
      {aiInsight && (
        <div className="p-5 rounded-2xl bg-[#fffbf9] border border-[#FF3700]/30 space-y-4 shadow-lg shadow-[#FF3700]/5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF3700] uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-[#FF3700]" />
              <span>NEXLAB AI Synthesizer</span>
            </div>
            {aiInsight.relatedTopics && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-600">
                {aiInsight.relatedTopics.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-[#FF3700]/10 rounded border border-[#FF3700]/20 text-[#FF3700] font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-zinc-800 leading-relaxed font-sans">
            {aiInsight.synthesizedInsight}
          </p>

          {aiRecommendedBooks.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-200/80">
              <h4 className="text-xs font-mono text-zinc-600 uppercase font-semibold">
                Curated High-Impact Matches
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {aiRecommendedBooks.map(({ book, rationale }) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700]/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mb-1">
                        <span className="text-[#FF3700] font-semibold">{book.category}</span>
                        <span>{book.estimatedReadTime}</span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-900 leading-tight group-hover:text-[#FF3700] transition-colors">
                        {book.title}
                      </h5>
                      <p className="text-[11px] text-zinc-600 mt-1 leading-snug">
                        {rationale}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-[#FF3700] font-medium">
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query Matches Grid (Fuzzy Search Results) */}
      {query.trim() && !aiInsight && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-600 font-mono">
            <span>{matchedBooks.length} books found matching "{query}"</span>
            {matchedBooks.length === 0 && (
              <span className="text-[#FF3700] font-medium">Try clicking "Search with AI" to synthesize</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={onSelectBook}
                onQuickRead={onOpenReader}
              />
            ))}
          </div>

          {matchedBooks.length === 0 && (
            <div className="py-12 text-center space-y-3 bg-white border border-zinc-200 rounded-2xl shadow-xs">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-sm text-zinc-700">
                No direct catalog title match for "{query}".
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Click <strong className="text-zinc-900">Search with AI</strong> above to have NEXLAB AI research and find adjacent domain literature.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

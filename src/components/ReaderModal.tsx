import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight, Bookmark, ArrowLeft } from 'lucide-react';
import { Book } from '../types';
import { useLibrary } from '../context/LibraryContext';

interface ReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose }) => {
  const { state, updateBookProgress, addBookNote } = useLibrary();
  const readingRecord = state.readingStatus[book.id];
  const [currentPage, setCurrentPage] = useState<number>(readingRecord?.currentPage || 1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [theme, setTheme] = useState<'midnight' | 'charcoal' | 'paper'>('midnight');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteAdded, setShowNoteAdded] = useState(false);

  const totalPages = book.pageCount || 300;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      updateBookProgress(book.id, next, totalPages);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      updateBookProgress(book.id, prev, totalPages);
    }
  };

  const handleSaveQuickNote = () => {
    if (!noteInput.trim()) return;
    addBookNote(book.id, noteInput, currentPage);
    setNoteInput('');
    setShowNoteAdded(true);
    setTimeout(() => setShowNoteAdded(false), 2000);
  };

  const themeClasses = {
    midnight: 'bg-white text-zinc-800 border-zinc-200',
    charcoal: 'bg-zinc-50 text-zinc-900 border-zinc-200',
    paper: 'bg-[#fafafa] text-zinc-800 border-zinc-200'
  };

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white flex flex-col animate-in fade-in duration-200">
      {/* Top Reading Navigation Bar */}
      <header className="h-14 shrink-0 bg-white border-b border-zinc-200 px-3 sm:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer group shrink-0"
            title="Go back to library"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF3700] group-hover:-translate-x-0.5 transition-transform" />
            <span>Go Back</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-[#FF3700] shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Open Reader</span>
          </div>
          <span className="text-zinc-300 hidden md:inline">·</span>
          <h2 className="text-xs sm:text-sm font-bold text-zinc-950 truncate max-w-[130px] xs:max-w-xs sm:max-w-md">
            {book.title}
          </h2>
          <span className="text-zinc-500 text-xs hidden lg:inline">by {book.author}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Reader Preferences */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            {(['sm', 'base', 'lg'] as const).map(size => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-lg cursor-pointer ${
                  fontSize === size ? 'bg-[#FF3700] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            {(['midnight', 'charcoal', 'paper'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 text-xs capitalize font-medium rounded-lg cursor-pointer ${
                  theme === t ? 'bg-[#FF3700] text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {t === 'midnight' ? 'Default' : t === 'charcoal' ? 'Soft' : 'Paper'}
              </button>
            ))}
          </div>

          {book.officialSource.url && (
            <a
              href={book.readOnlineUrl || book.officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-zinc-50 text-[#FF3700] hover:text-[#E53100] text-xs font-semibold border border-zinc-200 hover:border-[#FF3700]/40 transition-colors"
            >
              <span>Official Web Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reader Main Reading View */}
      <div className="flex-1 overflow-y-auto flex justify-center p-4 sm:p-8 bg-zinc-50/60">
        <main className={`w-full max-w-3xl rounded-3xl border p-6 sm:p-12 shadow-xl transition-colors ${themeClasses[theme]}`}>
          {/* Chapter Header */}
          <div className="border-b border-zinc-200 pb-6 mb-8 text-center space-y-2">
            <span className="text-xs font-mono text-[#FF3700] uppercase tracking-widest font-bold">
              {book.category} · Official Open Access Edition
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              {book.title}
            </h1>
            <p className="text-xs text-zinc-500">
              Authored by <span className="text-zinc-900 font-semibold">{book.author}</span> · License: {book.officialSource.license}
            </p>
          </div>

          {/* Interactive Reader Content */}
          <article className={`space-y-6 text-zinc-700 font-sans ${fontClasses[fontSize]}`}>
            <div className="p-4 rounded-2xl bg-zinc-50 border border-[#FF3700]/30 text-xs text-zinc-800 leading-relaxed font-mono">
              <p>
                <strong className="text-[#FF3700]">License & Provenance:</strong> This legal open-access digital reader is rendered in compliance with{' '}
                <span className="text-[#FF3700] underline font-semibold">{book.officialSource.license}</span>. Source archive verified at{' '}
                <strong className="text-zinc-900">{book.officialSource.name}</strong>.
              </p>
            </div>

            {book.sampleExcerpt ? (
              <blockquote className="border-l-3 border-[#FF3700] pl-4 italic text-zinc-800 my-4 text-base">
                "{book.sampleExcerpt}"
              </blockquote>
            ) : null}

            <p>
              {book.fullDescription}
            </p>

            <h3 className="text-lg font-bold text-zinc-950 pt-4">
              Core Architectural Principles
            </h3>

            <div className="space-y-3">
              {book.whatYouWillLearn.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[#FF3700] font-mono font-bold text-sm">{idx + 1}.</span>
                  <span className="text-zinc-800">{item}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-zinc-950 pt-4">
              Who Should Read This
            </h3>
            <p>{book.whoItIsFor}</p>

            {book.tableOfContents && (
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Syllabus Outline
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-700">
                  {book.tableOfContents.map((chap, i) => (
                    <div key={i} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                      {chap}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Quick study note input inside reader */}
          <div className="mt-12 pt-8 border-t border-zinc-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-700 font-semibold">Add note for Page {currentPage}</span>
              {showNoteAdded && <span className="text-[#FF3700] font-mono font-bold">Note recorded!</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Jot down a quick insight or takeaway..."
                className="flex-1 p-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700]"
              />
              <button
                onClick={handleSaveQuickNote}
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs font-semibold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Reader Bottom Navigation Bar */}
      <footer className="h-14 shrink-0 bg-white border-t border-zinc-200 px-4 sm:px-6 flex items-center justify-between text-xs text-zinc-600">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-zinc-50 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-zinc-800 font-semibold border border-zinc-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Page</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-zinc-900 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <span className="text-zinc-300">·</span>
          <span className="font-mono text-[#FF3700] font-bold">
            {Math.round((currentPage / totalPages) * 100)}% complete
          </span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-zinc-50 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-zinc-800 font-semibold border border-zinc-200"
        >
          <span>Next Page</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};

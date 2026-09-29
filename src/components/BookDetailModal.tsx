import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  BookOpen,
  Bookmark,
  Check,
  Star,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  ListPlus
} from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';
import { useLibrary } from '../context/LibraryContext';
import { BOOKS_DATA } from '../data/booksData';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onSelectBook,
  onOpenReader
}) => {
  const {
    isBookSaved,
    toggleSaveBook,
    state,
    allBooks,
    setReadingStatus,
    updateBookProgress,
    addBookNote,
    deleteBookNote,
    rateBook,
    addBookToList
  } = useLibrary();

  const saved = isBookSaved(book.id);
  const readingRecord = state.readingStatus[book.id];

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'lists'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNotePage, setNewNotePage] = useState<number | ''>('');
  const [userRating, setUserRating] = useState<number>(readingRecord?.rating || 0);
  const [userReview, setUserReview] = useState<string>(readingRecord?.review || '');
  const [showRatingSaved, setShowRatingSaved] = useState(false);

  // Find related books in same category or overlapping topics
  const relatedBooks = allBooks.filter(
    b => b.id !== book.id && (b.category === book.category || b.topics.some(t => book.topics.includes(t)))
  ).slice(0, 3);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addBookNote(book.id, newNoteText, typeof newNotePage === 'number' ? newNotePage : undefined);
    setNewNoteText('');
    setNewNotePage('');
  };

  const handleSaveReview = () => {
    rateBook(book.id, userRating, userReview);
    setShowRatingSaved(true);
    setTimeout(() => setShowRatingSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-[#FF3700] font-bold">{book.category}</span>
            <span className="text-zinc-300">/</span>
            <span>{book.skillLevel}</span>
            <span className="text-zinc-300">/</span>
            <span>{book.format}</span>
            {book.isCommunitySubmission ? (
              <>
                <span className="text-zinc-300">/</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  Community Upload
                </span>
              </>
            ) : (
              <>
                <span className="text-zinc-300">/</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Verified Official
                </span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Book Hero */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Left: Book Cover & Quick Status */}
            <div className="shrink-0 flex flex-col items-center md:items-start gap-3 w-full md:w-auto">
              <BookCover book={book} size="lg" className="mx-auto md:mx-0 shadow-2xl" />

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-2">
                {book.isLegallyFree && book.readOnlineUrl && (
                  <button
                    onClick={() => onOpenReader(book)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#FF3700] hover:bg-[#E53100] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#FF3700]/25 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Read Online</span>
                  </button>
                )}

                {book.isLegallyFree && book.downloadUrl && (
                  <a
                    href={book.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FF3700]" />
                    <span>Download Legal Copy</span>
                  </a>
                )}

                <button
                  onClick={() => toggleSaveBook(book.id)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
                    saved
                      ? 'bg-[#FF3700] border-[#FF3700] text-white shadow-md shadow-[#FF3700]/20'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-[#FF3700]/50'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved in Personal Library' : 'Save to Library'}</span>
                </button>
              </div>
            </div>

            {/* Right: Book Details & Meta */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-sm text-zinc-600 mt-1 leading-snug">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-xs text-zinc-500 mt-2">
                  By <span className="text-zinc-900 font-semibold">{book.author}</span>
                  {book.coAuthors && ` with ${book.coAuthors.join(', ')}`}
                </p>
              </div>

              {/* Metadata Badgeless Bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 py-2 border-y border-zinc-200">
                <div className="flex items-center gap-1 text-zinc-900 font-bold">
                  <Star className="w-4 h-4 fill-[#FF3700] text-[#FF3700]" />
                  <span className="font-mono">{book.rating.toFixed(2)}</span>
                  <span className="text-zinc-400 font-normal">({book.ratingsCount.toLocaleString()} ratings)</span>
                </div>
                <span className="text-zinc-300">·</span>
                <span>{book.pageCount} pages</span>
                <span className="text-zinc-300">·</span>
                <span>~{book.estimatedReadTime} read</span>
                <span className="text-zinc-300">·</span>
                <span>Published {book.publicationYear}</span>
                <span className="text-zinc-300">·</span>
                <span className="font-mono">{book.language}</span>
              </div>

              {/* Status Segmented Control (Interactive Button Tab) */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700 font-semibold">My Reading Status</span>
                  <span className="text-[#FF3700] font-mono font-bold">
                    {readingRecord ? `${readingRecord.progressPercent}% complete` : 'Not started'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-200/60 rounded-xl">
                  {(['want_to_read', 'reading', 'completed'] as const).map(statusKey => {
                    const isActive = readingRecord?.status === statusKey;
                    const labels = {
                      want_to_read: 'Want to Read',
                      reading: 'Currently Reading',
                      completed: 'Completed'
                    };
                    return (
                      <button
                        key={statusKey}
                        onClick={() => setReadingStatus(book.id, statusKey, undefined, book.pageCount)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#FF3700] text-white shadow-md shadow-[#FF3700]/25'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {labels[statusKey]}
                      </button>
                    );
                  })}
                </div>

                {readingRecord && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Progress (Page {readingRecord.currentPage} of {book.pageCount})</span>
                      <span className="font-mono text-[#FF3700] font-bold">{readingRecord.progressPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={book.pageCount}
                      value={readingRecord.currentPage}
                      onChange={e => updateBookProgress(book.id, parseInt(e.target.value, 10), book.pageCount)}
                      className="w-full accent-[#FF3700] cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* AI Recommendation Explanation Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-[#FF3700]/[0.05] border border-[#FF3700]/30 space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF3700]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF3700]" />
                  <span>Why NEXLAB recommends this book</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-sans">
                  {book.aiRecommendationExplanation}
                </p>
              </div>

              {/* Legal Availability & Source Verification Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#FF3700] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#FF3700]" />
                    <span>Verified Legal Availability: {book.availability}</span>
                  </div>
                  {book.officialSource.url && (
                    <a
                      href={book.officialSource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF3700] hover:text-[#E53100] inline-flex items-center gap-1 font-mono text-[11px] font-semibold"
                    >
                      <span>{book.officialSource.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {book.officialSource.verifiedNote} License: <span className="font-mono text-zinc-900 font-semibold">{book.officialSource.license}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#FF3700] text-[#FF3700]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Overview & Syllabus
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-[#FF3700] text-[#FF3700]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              My Notes & Rating ({readingRecord?.notes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'lists'
                  ? 'border-[#FF3700] text-[#FF3700]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Add to Reading Lists
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2 font-mono">
                  Description
                </h4>
                <p className="text-sm text-zinc-700 leading-relaxed font-sans">
                  {book.fullDescription}
                </p>
              </div>

              {/* What You Will Learn & Who It Is For */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                    What You Will Learn
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-700">
                    {book.whatYouWillLearn.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#FF3700] font-mono mt-0.5 font-bold">›</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                      Who It Is For
                    </h4>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {book.whoItIsFor}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                      Difficulty Level
                    </h4>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {book.difficulty}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table of Contents / Outline */}
              {book.tableOfContents && (
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                    Syllabus & Core Chapters
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-zinc-600 font-mono">
                    {book.tableOfContents.map((chapter, i) => (
                      <div key={i} className="py-1.5 border-b border-zinc-200 flex items-center gap-2">
                        <span className="text-[#FF3700] font-bold text-[10px] w-4">{i + 1}.</span>
                        <span className="text-zinc-800 truncate">{chapter}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono mb-2">
                  Topics Covered
                </h4>
                <div className="flex flex-wrap gap-2 text-xs text-zinc-700 font-mono">
                  {book.topics.map(topic => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-zinc-100 border border-zinc-200 hover:border-[#FF3700] rounded-full transition-colors"
                    >
                      #{topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Books */}
              {relatedBooks.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-zinc-200">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                    Related Books in Catalog
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {relatedBooks.map(rb => (
                      <div
                        key={rb.id}
                        onClick={() => onSelectBook(rb)}
                        className="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-[#FF3700] rounded-xl cursor-pointer transition-all flex gap-3 items-center group shadow-sm hover:shadow-md"
                      >
                        <BookCover book={rb} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">{rb.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{rb.author}</p>
                          <span className="text-[9px] text-[#FF3700] font-mono font-semibold">{rb.estimatedReadTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Notes & Personal Review */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Rating & Review Form */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  My Book Rating & Review
                </h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 text-zinc-300 hover:text-[#FF3700] transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating
                            ? 'fill-[#FF3700] text-[#FF3700]'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-zinc-600 ml-2 font-mono">
                    {userRating > 0 ? `${userRating} of 5 Stars` : 'Click to rate'}
                  </span>
                </div>

                <textarea
                  value={userReview}
                  onChange={e => setUserReview(e.target.value)}
                  placeholder="What are your thoughts on this book? Key takeaways, insights, or critique..."
                  rows={3}
                  className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#FF3700] font-mono font-bold">
                    {showRatingSaved && 'Rating and review saved!'}
                  </span>
                  <button
                    onClick={handleSaveReview}
                    className="py-2 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs font-semibold transition-all shadow-md shadow-[#FF3700]/25 cursor-pointer"
                  >
                    Save Review
                  </button>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Add Study Note or Highlight
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    placeholder="Enter an architectural takeaway, mental model, or quote..."
                    className="flex-1 p-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#FF3700]"
                  />
                  <input
                    type="number"
                    value={newNotePage}
                    onChange={e => setNewNotePage(e.target.value ? parseInt(e.target.value, 10) : '')}
                    placeholder="Page #"
                    className="w-20 p-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono text-center placeholder-zinc-400 focus:outline-none focus:border-[#FF3700]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs font-semibold transition-all shadow-md shadow-[#FF3700]/25 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Recorded Notes ({readingRecord?.notes?.length || 0})
                </h4>

                {(!readingRecord?.notes || readingRecord.notes.length === 0) ? (
                  <p className="text-xs text-zinc-500 italic py-4 text-center">
                    No notes recorded yet for this book. Add your first note above to capture insights.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {readingRecord.notes.map(note => (
                      <div
                        key={note.id}
                        className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <p className="text-zinc-800 leading-relaxed font-sans">{note.text}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                            {note.page && <span className="text-[#FF3700] font-bold">Page {note.page}</span>}
                            {note.page && <span>·</span>}
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteBookNote(book.id, note.id)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Reading Lists */}
          {activeTab === 'lists' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                My Curated Reading Lists
              </h4>

              <div className="space-y-2">
                {state.readingLists.map(list => {
                  const isInList = list.bookIds.includes(book.id);
                  return (
                    <div
                      key={list.id}
                      className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-zinc-950">{list.name}</h5>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{list.description}</p>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {list.bookIds.length} books in list
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (!isInList) {
                            addBookToList(list.id, book.id);
                          }
                        }}
                        disabled={isInList}
                        className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          isInList
                            ? 'bg-zinc-200/80 text-zinc-700 cursor-default'
                            : 'bg-[#FF3700] hover:bg-[#E53100] text-white shadow-sm'
                        }`}
                      >
                        {isInList ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-zinc-700" />
                            <span>In List</span>
                          </>
                        ) : (
                          <>
                            <ListPlus className="w-3.5 h-3.5" />
                            <span>Add to List</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  User,
  Clock,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Plus,
  Trash2,
  Star,
  Flame,
  ArrowRight,
  Edit3,
  Calendar
} from 'lucide-react';
import { Book } from '../types';
import { BOOKS_DATA } from '../data/booksData';
import { READING_PATHS_DATA } from '../data/readingPathsData';
import { useLibrary } from '../context/LibraryContext';
import { BookCover } from './BookCover';
import { BookCard } from './BookCard';

interface DashboardViewProps {
  onSelectBook: (book: Book) => void;
  onOpenReader?: (book: Book) => void;
  onNavigateToPaths?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectBook,
  onOpenReader,
  onNavigateToPaths
}) => {
  const {
    state,
    updateBookProgress,
    createReadingList,
    deleteReadingList,
    updateProfile
  } = useLibrary();

  const [activeSection, setActiveSection] = useState<'overview' | 'saved' | 'lists' | 'history'>('overview');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Profile Edit Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(state.profile.name);
  const [editRole, setEditRole] = useState(state.profile.role);
  const [editProject, setEditProject] = useState(state.profile.currentProject);
  const [editDailyMins, setEditDailyMins] = useState(state.profile.dailyReadingMinutes);

  // Books currently being read
  const readingBooks = Object.entries(state.readingStatus)
    .filter(([_, record]) => record.status === 'reading')
    .map(([bookId, record]) => {
      const book = BOOKS_DATA.find(b => b.id === bookId);
      return book ? { book, record } : null;
    })
    .filter(Boolean) as { book: Book; record: any }[];

  // Completed books
  const completedBooks = Object.entries(state.readingStatus)
    .filter(([_, record]) => record.status === 'completed')
    .map(([bookId, record]) => {
      const book = BOOKS_DATA.find(b => b.id === bookId);
      return book ? { book, record } : null;
    })
    .filter(Boolean) as { book: Book; record: any }[];

  // Saved books
  const savedBooks = state.savedBookIds
    .map(id => BOOKS_DATA.find(b => b.id === id))
    .filter(Boolean) as Book[];

  // Enrolled paths
  const enrolledPaths = state.enrolledPathIds
    .map(id => READING_PATHS_DATA.find(p => p.id === id))
    .filter(Boolean);

  // Personalized recommendations based on user interests
  const personalizedBooks = BOOKS_DATA.filter(
    b =>
      !state.savedBookIds.includes(b.id) &&
      !state.readingStatus[b.id] &&
      (state.profile.interests.some(interest => b.topics.includes(interest)) ||
        b.category === 'Development')
  ).slice(0, 3);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createReadingList(newListName.trim(), newListDesc.trim());
    setNewListName('');
    setNewListDesc('');
    setShowCreateListModal(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      role: editRole,
      currentProject: editProject,
      dailyReadingMinutes: editDailyMins
    });
    setShowEditProfileModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* User Profile Bar */}
      <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FF3700] border border-[#FF3700] flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-[#FF3700]/30 shrink-0">
            {state.profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-950 tracking-tight">
                {state.profile.name}
              </h1>
              <span className="text-xs font-mono text-zinc-400">
                {state.profile.handle}
              </span>
            </div>
            <p className="text-xs text-[#FF3700] font-bold">
              {state.profile.role}
            </p>
            {state.profile.currentProject && (
              <p className="text-xs text-zinc-500 mt-1">
                Current Focus: <span className="text-zinc-800 font-mono font-medium">{state.profile.currentProject}</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-6 text-xs">
          <div>
            <span className="text-zinc-500 font-mono block">Reading</span>
            <span className="text-lg font-bold text-zinc-950 font-mono">{readingBooks.length}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Completed</span>
            <span className="text-lg font-bold text-[#FF3700] font-mono">{completedBooks.length}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Saved Books</span>
            <span className="text-lg font-bold text-[#FF3700] font-mono">{savedBooks.length}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-mono block">Daily Target</span>
            <span className="text-lg font-bold text-zinc-950 font-mono">{state.profile.dailyReadingMinutes}m</span>
          </div>

          <button
            onClick={() => setShowEditProfileModal(true)}
            className="p-2.5 text-zinc-600 hover:text-[#FF3700] rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-1">
        <button
          onClick={() => setActiveSection('overview')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'overview'
              ? 'border-[#FF3700] text-[#FF3700]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Reading Overview
        </button>
        <button
          onClick={() => setActiveSection('saved')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'saved'
              ? 'border-[#FF3700] text-[#FF3700]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Saved Shelf ({savedBooks.length})
        </button>
        <button
          onClick={() => setActiveSection('lists')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'lists'
              ? 'border-[#FF3700] text-[#FF3700]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Reading Lists ({state.readingLists.length})
        </button>
        <button
          onClick={() => setActiveSection('history')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeSection === 'history'
              ? 'border-[#FF3700] text-[#FF3700]'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Reading Activity & History
        </button>
      </div>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Continue Reading Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Continue Reading ({readingBooks.length})
              </h2>
            </div>

            {readingBooks.length === 0 ? (
              <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs text-zinc-500">
                  You are not currently reading any books. Explore the catalog and mark a book as reading.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {readingBooks.map(({ book, record }) => (
                  <div
                    key={book.id}
                    className="p-5 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-2xl transition-all space-y-3 shadow-sm hover:shadow-md"
                  >
                    <div className="flex gap-4 items-start">
                      <div
                        onClick={() => onSelectBook(book)}
                        className="cursor-pointer shrink-0"
                      >
                        <BookCover book={book} size="sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-[#FF3700] font-bold block mb-0.5">
                          {book.category} · {book.skillLevel}
                        </span>
                        <h3
                          onClick={() => onSelectBook(book)}
                          className="text-sm font-bold text-zinc-950 hover:text-[#FF3700] transition-colors cursor-pointer truncate"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">by {book.author}</p>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>Page {record.currentPage} of {record.totalPages}</span>
                          <span className="text-[#FF3700] font-bold">{record.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2 mt-1 overflow-hidden">
                          <div
                            className="bg-[#FF3700] h-full rounded-full transition-all duration-300"
                            style={{ width: `${record.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Progress Slider */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-3 text-xs">
                      <input
                        type="range"
                        min="0"
                        max={record.totalPages}
                        value={record.currentPage}
                        onChange={e => updateBookProgress(book.id, parseInt(e.target.value, 10), record.totalPages)}
                        className="flex-1 accent-[#FF3700] cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
                      />
                      {book.isLegallyFree && book.readOnlineUrl && onOpenReader && (
                        <button
                          onClick={() => onOpenReader(book)}
                          className="inline-flex items-center gap-1 py-1.5 px-3 rounded-full bg-zinc-50 hover:bg-[#FF3700] hover:text-white text-[#FF3700] font-semibold text-[11px] border border-zinc-200 transition-colors cursor-pointer shrink-0"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Open Reader</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Reading Paths */}
          {enrolledPaths.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Enrolled Reading Paths ({enrolledPaths.length})
                </h2>
                {onNavigateToPaths && (
                  <button
                    onClick={onNavigateToPaths}
                    className="text-xs text-[#FF3700] hover:text-[#E53100] inline-flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <span>View all paths</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {enrolledPaths.map(path => {
                  if (!path) return null;
                  const progress = state.pathProgress[path.id] || { currentStage: 1, completedStages: [] };
                  const percent = Math.round((progress.completedStages.length / path.stages.length) * 100);

                  return (
                    <div
                      key={path.id}
                      className="p-6 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-2xl space-y-3 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                        <span className="text-[#FF3700] font-bold">{path.category}</span>
                        <span className="font-semibold text-zinc-700">{percent}% Completed</span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-950">
                        {path.title}
                      </h3>
                      <p className="text-xs text-zinc-600 line-clamp-2">
                        {path.description}
                      </p>

                      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                        <span className="text-zinc-600 font-mono text-[11px]">
                          Current: Stage {progress.currentStage} ({path.stages[progress.currentStage - 1]?.name || 'Finished'})
                        </span>
                        {onNavigateToPaths && (
                          <button
                            onClick={onNavigateToPaths}
                            className="text-[#FF3700] hover:text-[#E53100] font-bold cursor-pointer"
                          >
                            Continue Path
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommended Books for Profile */}
          {personalizedBooks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF3700]" />
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                  Personalized AI Recommendations for You
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {personalizedBooks.map(book => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="p-5 bg-white hover:bg-zinc-50/50 border border-zinc-200 hover:border-[#FF3700] rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                  >
                    <div className="flex gap-3 items-start">
                      <BookCover book={book} size="sm" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-[#FF3700] font-bold block">
                          {book.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-950 group-hover:text-[#FF3700] transition-colors truncate">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                          {book.aiRecommendationExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-[#FF3700] font-bold">
                      <span>{book.estimatedReadTime} read</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Books Shelf */}
          {completedBooks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Completed Books Shelf ({completedBooks.length})
              </h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {completedBooks.map(({ book, record }) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="p-3 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-xl flex items-center gap-3 cursor-pointer shadow-sm transition-all"
                  >
                    <BookCover book={book} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-[#FF3700] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-950 truncate mt-0.5">
                        {book.title}
                      </h4>
                      {record.rating && (
                        <div className="flex items-center gap-1 text-[#FF3700] text-[10px] mt-1 font-semibold">
                          <Star className="w-3 h-3 fill-[#FF3700]" />
                          <span>{record.rating} / 5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SAVED SHELF */}
      {activeSection === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>{savedBooks.length} books in your personal saved shelf</span>
          </div>

          {savedBooks.length === 0 ? (
            <div className="py-16 text-center bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
              <Bookmark className="w-8 h-8 text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500">
                You haven't bookmarked any books yet. Click the bookmark icon on any card to save it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={onSelectBook}
                  onQuickRead={onOpenReader}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: READING LISTS */}
      {activeSection === 'lists' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
              Custom Reading Lists
            </h2>
            <button
              onClick={() => setShowCreateListModal(true)}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full text-xs font-semibold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Reading List</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {state.readingLists.map(list => {
              const listBooks = list.bookIds
                .map(id => BOOKS_DATA.find(b => b.id === id))
                .filter(Boolean) as Book[];

              return (
                <div
                  key={list.id}
                  className="p-6 bg-white border border-zinc-200 hover:border-[#FF3700] rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-950">{list.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{list.description}</p>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                        Created {new Date(list.createdAt).toLocaleDateString()} · {list.bookIds.length} books
                      </span>
                    </div>

                    <button
                      onClick={() => deleteReadingList(list.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete List"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* List Book Covers Stack */}
                  <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {listBooks.map(b => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBook(b)}
                        className="cursor-pointer shrink-0"
                        title={b.title}
                      >
                        <BookCover book={b} size="sm" />
                      </div>
                    ))}
                    {listBooks.length === 0 && (
                      <p className="text-xs text-zinc-400 italic py-3">
                        No books added to this list yet. View any book to add it.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: READING HISTORY */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
            Reading Activity Timeline
          </h2>

          <div className="p-4 bg-white border border-zinc-200 rounded-2xl space-y-3 shadow-sm">
            {state.history.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">
                No activity recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {state.history.map(item => {
                  const book = BOOKS_DATA.find(b => b.id === item.bookId);
                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#FF3700]" />
                        <div>
                          <span className="text-zinc-900 font-medium">
                            {book?.title || 'Book'}
                          </span>
                          <span className="text-zinc-500 ml-2 font-mono text-[11px]">
                            ({item.detail || item.action})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Reading List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-950">Create New Reading List</h3>
            <form onSubmit={handleCreateList} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-700 font-medium block mb-1">List Name</label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="e.g. Distributed Database Mastery, Founder Canon..."
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-[#FF3700]"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-medium block mb-1">Description</label>
                <textarea
                  value={newListDesc}
                  onChange={e => setNewListDesc(e.target.value)}
                  placeholder="What is the objective or theme of this reading list?"
                  rows={2}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-[#FF3700]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(false)}
                  className="py-2 px-4 text-zinc-500 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full font-semibold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-950">Edit Personal Reading Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-700 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-medium block mb-1">Professional Role</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-medium block mb-1">What are you currently building?</label>
                <input
                  type="text"
                  value={editProject}
                  onChange={e => setEditProject(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900"
                />
              </div>

              <div>
                <label className="text-zinc-700 font-medium block mb-1">Daily Reading Target: {editDailyMins} minutes</label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="15"
                  value={editDailyMins}
                  onChange={e => setEditDailyMins(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FF3700]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="py-2 px-4 text-zinc-500 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#FF3700] hover:bg-[#E53100] text-white rounded-full font-semibold cursor-pointer shadow-md shadow-[#FF3700]/25 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
